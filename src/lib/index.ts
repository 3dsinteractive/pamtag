import IConfig from "./interface/iconfig";
import { PamAPI } from "./api";
import { QueueManager, RequestJob } from "./queue_manager";
import { ITrackerResponse } from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
import { Utils } from "./utils";
import { Hook } from "./core/hook";
import { PluginRegistration } from "./plugins/index";
import { ContactStateManager } from "./contact_state_manager";

class PamTracker {
  config: IConfig;
  api: PamAPI;
  contactState: ContactStateManager;
  hook = new Hook();
  utils = new Utils();

  queueManager = new QueueManager<ITrackerResponse>(50, async (jobs) => {
    if (jobs.length == 1) {
      const job = jobs[0];

      let jsonPayload = this.buildEventPayload(job);

      // Hook Pre Event
      jsonPayload = await this.hook.dispatchPreTracking(job.event, jsonPayload);

      const response = await this.api.postTracker(jsonPayload);

      // Hook Post Event
      this.hook.dispatchPostTracking(job.event, jsonPayload, response);

      return [response];
    } else if (jobs.length > 1) {
      const events: Record<string, any>[] = [];

      for (const i in jobs) {
        const job = jobs[i];
        let jsonPayload = this.buildEventPayload(job);
        jsonPayload = await this.hook.dispatchPreTracking(
          job.event,
          jsonPayload
        );

        events.push(jsonPayload);
      }

      let useSameContact = true;
      if (events.length > 0 && events[0]._contact_id) {
        useSameContact = false;
      }

      const response = await this.api.postTrackers(useSameContact, events);

      for (const i in response.results) {
        const r = response.results[i];
        const e = events[i];
        this.hook.dispatchPostTracking(e.event, e, r);
      }

      return response.results;
    }

    return [];
  });

  constructor(config: IConfig) {
    if (!config.preferLanguage) {
      config.preferLanguage = "th";
    }
    this.config = config;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.initialize(config);
      });
    } else {
      setTimeout(() => {
        this.initialize(config);
      }, 100);
    }
  }

  private initialize(config: IConfig) {
    this.api = new PamAPI(config.baseApi);

    //Contact state will handle the state inside plugins/login_state.ts
    this.contactState = new ContactStateManager(
      config.publicDBAlias,
      config.loginDBAlias,
      config.loginKey
    );
    this.contactState.resumeSession();

    if (!this.config.sessionExpireTimeMinutes) {
      this.config.sessionExpireTimeMinutes = 60;
    }

    const pluginRegister = new PluginRegistration();
    for (const i in pluginRegister.plugins) {
      pluginRegister.plugins[i].initPlugin(this);
    }

    // Hook StartUp
    this.hook.dispatchOnStartup(config);
  }

  buildEventPayload(job: RequestJob<ITrackerResponse>) {
    const payload = this.api.getDefaultPayload();
    payload.event = job.event;

    const form_fields = { ...job.data };
    form_fields._consent_message_id = job.trackingConsentMessageId;

    payload.form_fields = {
      ...form_fields,
    };

    return payload;
  }

  async userLogin(loginId: string) {
    const loginKey = this.config.loginKey;
    const data: Record<string, any> = {};
    data[loginKey] = loginId;

    let job: RequestJob<ITrackerResponse> = {
      event: "login",
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: data,
      flushEventBefore: false,
    };
    await this.queueManager.enqueueJob(job);

    job = {
      event: "login",
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: data,
      flushEventBefore: true,
    };
    await this.queueManager.enqueueJob(job);
  }

  async userLogout() {
    const job: RequestJob<ITrackerResponse> = {
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
      event: event,
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: payload,
      flushEventBefore: flushEventBefore,
    };

    return this.queueManager.enqueueJob(job);
  }

  async cleanPamCookies() {
    this.hook.dispatchOnClean(this.config);
  }

  async submitConsent(
    consent: ConsentMessage,
    flushEventBefore: boolean = false
  ) {
    const job: RequestJob<ITrackerResponse> = {
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
