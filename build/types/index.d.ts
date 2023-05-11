import IConfig from "./interface/iconfig";
import { QueueManager } from "./queue_manager";
import { ITrackerResponse } from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
declare class PamTracker {
    private config;
    private api;
    private contactState;
    queueManager: QueueManager<ITrackerResponse>;
    constructor(config: IConfig);
    userLogin(loginId: string): Promise<ITrackerResponse>;
    userLogout(): Promise<ITrackerResponse>;
    track(event: string, payload?: Record<string, any>, flushEventBefore?: boolean): Promise<ITrackerResponse>;
    submitConsent(consent: ConsentMessage, flushEventBefore?: boolean): Promise<ITrackerResponse>;
    loadConsentDetails(consentMessageIDs: string[]): Promise<Record<string, ConsentMessage>>;
    loadConsentDetail(consentMessageID: string): Promise<ConsentMessage>;
}
export default PamTracker;
