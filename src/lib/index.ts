import IConfig from "./interface/iconfig";
import { PamAPI } from "./api";
import { QueueManager, RequestJob } from "./queue_manager";
import { ITrackerResponse } from "./interface/itracker_response";
import { ContactStateManager } from "./contact_state_manager";
import { ConsentMessage } from "./interface/consent_message";
import { JobType } from "./enums/enums";
class PamTracker {
  private config: IConfig;
  private api: PamAPI;
  private contactState: ContactStateManager;

  queueManager = new QueueManager<ITrackerResponse>(50, async (jobs) => {
    if (jobs.length == 1) {
      const job = jobs[0];

      const contactId = this.contactState.getContactId();
      const database = this.contactState.getDatabase();

      const jsonPayload = this.buildEventPayload(job, contactId, database);

      const response = await this.api.postTracker(jsonPayload);

      if (job.jobType === JobType.LOGIN) {
        const loginKey = this.contactState.getLoginKey();
        const loginId = job.data[loginKey];
        this.contactState.login(loginId);
      }

      if (job.jobType === JobType.LOGOUT) {
        this.contactState.logout();
      }

      this.contactState.setContactId(response.contact_id);

      return [response];
    } else if (jobs.length > 1) {
      const contactId = this.contactState.getContactId();
      const database = this.contactState.getDatabase();

      let useSameContact = true;
      if (contactId && contactId != "") {
        useSameContact = false;
      }

      const events: Record<string, any>[] = [];

      for (const i in jobs) {
        const job = jobs[i];
        const jsonPayload = this.buildEventPayload(job, contactId, database);
        events.push(jsonPayload);
      }

      const response = await this.api.postTrackers(useSameContact, events);

      const lastJob = jobs[jobs.length - 1];
      if (lastJob.jobType === JobType.LOGIN) {
        const loginKey = this.contactState.getLoginKey();
        const loginId = lastJob.data[loginKey];
        this.contactState.login(loginId);
      }

      if (lastJob.jobType === JobType.LOGOUT) {
        this.contactState.logout();
      }

      return response.results;
    }

    return [];
  });

  constructor(config: IConfig) {
    this.config = config;
    this.api = new PamAPI(config.baseApi);

    this.contactState = new ContactStateManager(
      config.publicDBAlias,
      config.loginDBAlias,
      config.loginKey
    );

    this.contactState.resumeSession();
  }

  buildEventPayload(
    job: RequestJob<ITrackerResponse>,
    contactId: string,
    database: string
  ) {
    const payload = this.api.getDefaultPayload();
    payload.event = job.event;

    const form_fields = { ...job.data };
    form_fields._consent_message_id = job.trackingConsentMessageId;
    form_fields._database = database;
    payload.form_fields = {
      ...form_fields,
      _contact_id: contactId,
      _database: database,
    };
    return payload;
  }

  async userLogin(loginId: string) {
    const loginKey = this.contactState.getLoginKey();
    const data: Record<string, any> = {};
    data[loginKey] = loginId;

    let job: RequestJob<ITrackerResponse> = {
      jobType: JobType.LOGIN,
      event: "login",
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: data,
      flushEventBefore: false,
    };
    await this.queueManager.enqueueJob(job);

    job = {
      jobType: JobType.LOGIN,
      event: "login",
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: data,
      flushEventBefore: true,
    };
    await this.queueManager.enqueueJob(job);
  }

  async userLogout() {
    const job: RequestJob<ITrackerResponse> = {
      jobType: JobType.LOGOUT,
      event: "logout",
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: {},
      flushEventBefore: false,
    };
    return this.queueManager.enqueueJob(job);
  }

  async track(
    event: string,
    payload: Record<string, any> = {},
    flushEventBefore: boolean = false
  ) {
    const job: RequestJob<ITrackerResponse> = {
      jobType: JobType.TRACK,
      event: event,
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: payload,
      flushEventBefore: flushEventBefore,
    };

    return this.queueManager.enqueueJob(job);
  }

  async submitConsent(
    consent: ConsentMessage,
    flushEventBefore: boolean = false
  ) {
    const job: RequestJob<ITrackerResponse> = {
      jobType: JobType.ALLOW_CONSENT,
      event: "allow_consent",
      trackingConsentMessageId: consent.data.consent_message_id,
      data: consent.buildFormField(),
      flushEventBefore: flushEventBefore,
    };

    return this.queueManager.enqueueJob(job);
  }

  async loadConsentDetails(consentMessageIDs: string[]) {
    const result = await this.api.loadConsentDetails(consentMessageIDs);
    return result;
  }

  async loadConsentDetail(consentMessageID: string) {
    const result = await this.api.loadConsentDetails([consentMessageID]);
    return result[consentMessageID];
  }
}

export default PamTracker;
