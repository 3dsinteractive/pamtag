import { HTTPClient } from "./httpclient";
import {
  ITrackerResponse,
  IBulkTrackerResponse,
} from "./interface/itracker_response";
import { IConsentMessage, ConsentMessage } from "./interface/consent_message";
import { RequestJob } from "./queue_manager";

export class PamAPI {
  private http: HTTPClient;

  constructor(baseAPIURL: string) {
    this.http = new HTTPClient(baseAPIURL);
  }

  private getPageURL() {
    return window.document.location && window.document.location.href;
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
    const response = await this.http.post("/trackers/events", data, headers);
    return response;
  }

  async postTrackers(
    useSameContact: boolean,
    events: Record<string, any>[],
    headers: Record<string, any> = {}
  ): Promise<IBulkTrackerResponse> {
    const payload = {
      _use_first_contact_id_for_all_events: useSameContact,
      events: events,
    };

    const response: IBulkTrackerResponse = await this.http.post(
      "/trackers/events",
      payload,
      headers
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
