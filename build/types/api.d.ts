import { ITrackerResponse } from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
export declare class PamAPI {
    private http;
    constructor(baseAPIURL: string);
    private getPageURL;
    private getDefaultPayload;
    postTracker(event: string, contactId: string, trackingConsentMessageId: string, database: string, formFields: Record<string, any>, headers: Record<string, any>): Promise<ITrackerResponse>;
    loadConsentDetails(consentMessageIDs: string[]): Promise<Record<string, ConsentMessage>>;
}
