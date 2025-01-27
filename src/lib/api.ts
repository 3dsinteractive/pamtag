import { HTTPClient } from "./httpclient";
import {
  ITrackerResponse,
  IBulkTrackerResponse,
} from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
import { IAttentionItem } from "./interface/attention";
import { ICustomerConsentStatus } from "./interface/iconsent_status";
import { Utils } from "./utils";
export class PamAPI {
  private http: HTTPClient;

  constructor(baseAPIURL: string) {
    this.http = new HTTPClient(baseAPIURL);
  }

  async getWebAttention(
    contactId: string,
    pageUrl: string
  ): Promise<IAttentionItem> {
    let payload: any = {
      _contact_id: contactId,
    };

    const url = Utils.getPageURL();
    if (url) {
      payload.page_url = decodeURI(url);
    }

    return await this.http.post("/attention", payload, {});
  }

  getDefaultPayload(): Record<string, any> {
    let payload: any = {};
    const lang = Utils.getBrowserLanguage();
    if (lang) {
      payload.page_language = lang;
    }

    const windowTitle = Utils.getWindowTitle();
    if (windowTitle) {
      payload.page_title = windowTitle;
    }

    const pageURL = Utils.getPageURL();
    if (pageURL) {
      payload.page_url = decodeURI(pageURL);
    }

    const pageReferer = Utils.getPageReferer();
    if (pageReferer) {
      payload.page_referrer = pageReferer;
    }

    if (Utils.isMobileAppMode()) {
      payload.platform = "mobile";
      payload.user_agent = "MobileApp";
    } else {
      payload.platform = "browser";
      const userAgent = Utils.getUserAgent();
      if (userAgent) {
        payload.user_agent = userAgent;
      }
    }

    return payload;
  }

  async postTracker(
    data: Record<string, any>,
    headers: Record<string, any> = {}
  ): Promise<ITrackerResponse | null> {
    let cookieLess = false;
    if (data.form_fields._cookie_less === true) {
      cookieLess = true;
      delete data.form_fields._contact_id;
    }
    delete data.form_fields._cookie_less;
    console.log("POST data", data);
    try {
      const response = await this.http.post(
        "/trackers/events",
        data,
        headers,
        cookieLess
      );

      console.log("Response", response);
      response.cancelled = false;
      return response;
    } catch (e) {}

    return null;
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

    try {
      const response: IBulkTrackerResponse = await this.http.post(
        "/trackers/events",
        payload,
        headers,
        cookieLess
      );
      return response;
    } catch (e) {}

    return { results: [] };
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
