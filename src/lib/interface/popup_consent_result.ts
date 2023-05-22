import { ConsentMessage } from "./consent_message";
import { ITrackerResponse } from "./itracker_response";

export interface PopupConsentResult {
  consent?: ConsentMessage;
  response?: ITrackerResponse;
}
