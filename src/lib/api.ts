import { HTTPClient } from "./httpclient";
import {
  ITrackerResponse,
  IBulkTrackerResponse,
} from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
import { IAttentionItem } from "./interface/attention";
import { ICustomerConsentStatus } from "./interface/iconsent_status";
export class PamAPI {
  private http: HTTPClient;

  constructor(baseAPIURL: string) {
    this.http = new HTTPClient(baseAPIURL);
  }

  private getPageURL() {
    return window.document.location && window.document.location.href;
  }

  async getWebAttention(
    contactId: string,
    pageUrl: string
  ): Promise<IAttentionItem> {
    return await this.http.post(
      "/attention",
      {
        page_url: decodeURI(this.getPageURL()),
        _contact_id: contactId,
      },
      {}
    );
  }

  getDefaultPayload(): Record<string, any> {
    return {
      page_language: window.navigator.language,
      page_referrer: window.document.referrer,
      page_title: window.document.title,
      page_url: decodeURI(this.getPageURL()),
      platform: "browser",
      user_agent: window.navigator.userAgent,
    };
  }

  async postTracker(
    data: Record<string, any>,
    headers: Record<string, any> = {}
  ): Promise<ITrackerResponse> {
    let cookieLess = false;
    if (data.form_fields._cookie_less === true) {
      cookieLess = true;
      delete data.form_fields._contact_id;
    }
    delete data.form_fields._cookie_less;

    const response = await this.http.post(
      "/trackers/events",
      data,
      headers,
      cookieLess
    );
    return response;
  }

  async postTrackers(
    useSameContact: boolean,
    events: Record<string, any>[],
    headers: Record<string, any> = {}
  ): Promise<IBulkTrackerResponse> {
    let cookieLess = false;

    for (const i in events) {
      if (events[i].form_fields._cookie_less === true) {
        cookieLess = true;
        useSameContact = true;
        delete events[i].form_fields._contact_id;
      }
      delete events[i].form_fields._cookie_less;
    }

    // Remove _contact_id if cookie less mode
    if (cookieLess) {
      for (const i in events) {
        delete events[i].form_fields._contact_id;
      }
    }

    const payload = {
      _use_first_contact_id_for_all_events: useSameContact,
      events: events,
    };

    const response: IBulkTrackerResponse = await this.http.post(
      "/trackers/events",
      payload,
      headers,
      cookieLess
    );
    return response;
  }

  async loadConsentStatus(
    contactId: string,
    consentMessageIDs: string
  ): Promise<ICustomerConsentStatus> {
    const response = await this.http.get(
      `/contacts/${contactId}/consents/${consentMessageIDs}`,
      {}
    );

    return response;
  }

  async loadConsentDetails(
    consentMessageIDs: string[]
  ): Promise<Record<string, ConsentMessage>> {
    const result: Record<string, ConsentMessage> = {};

    while (consentMessageIDs.length > 0) {
      const id = consentMessageIDs.shift();
      const response = await this.http.get(`/consent-message/${id}`, {});
      result[id] = new ConsentMessage(response);
    }

    return result;
  }
}
