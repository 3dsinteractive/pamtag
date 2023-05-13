import IConfig from "./interface/iconfig";
import { PamAPI } from "./api";
import { QueueManager, RequestJob } from "./queue_manager";
import { ITrackerResponse } from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
import { JobType } from "./enums/enums";
import { Utils } from "./utils";
import { Hook } from "./core/hook";
import { PluginRegistration } from "./plugins/index";

class PamTracker {
  config: IConfig;
  private api: PamAPI;

  hook = new Hook();
  utils = new Utils();

  queueManager = new QueueManager<ITrackerResponse>(50, async (jobs) => {
    if (jobs.length == 1) {
      const job = jobs[0];

      let jsonPayload = this.buildEventPayload(job);
      console.log("Origitnal", jsonPayload);
      // Hook Pre Event
      jsonPayload = await this.hook.dispatchPreTracking(job.event, jsonPayload);

      console.log("Plugin", jsonPayload);

      const response = await this.api.postTracker(jsonPayload);

      // Hook Post Event
      this.hook.dispatchPostTracking(job.event, jsonPayload, response);

      return [response];
    } else if (jobs.length > 1) {
      const events: Record<string, any>[] = [];

      for (const i in jobs) {
        const job = jobs[i];
        let jsonPayload = this.buildEventPayload(job);
        jsonPayload = this.hook.dispatchPreTracking(job.event, jsonPayload);
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
    this.createGetPamFunction();
    this.prepareGTM();
    this.config = config;
    this.api = new PamAPI(config.baseApi);

    if (!this.config.sessionExpireTimeMinutes) {
      this.config.sessionExpireTimeMinutes = 60;
    }

    const pluginRegister = new PluginRegistration();
    for (const i in pluginRegister.plugins) {
      pluginRegister.plugins[i].initPlugin(this);
    }

    this.hook.dispatchOnStartup(config);

    if (config.autoTrackPageview === true) {
      this.autoTrackPageview();
    }
  }

  private createGetPamFunction() {
    const w = window as any;
    w.getPam = function () {
      return new Promise(function (resolve) {
        if (w.pam) {
          resolve(w.pam);
          return;
        }
        var intervalId = setInterval(function () {
          if (w.pam !== null && typeof w.pam !== "undefined") {
            clearInterval(intervalId);
            resolve(w.pam);
          }
        }, 200);
      });
    };
  }

  private autoTrackPageview() {
    this.track("page_view");

    var previousUrl = "";

    var observer = new MutationObserver((mutations) => {
      if (location.href !== previousUrl) {
        previousUrl = location.href;
        this.track("page_view");
      }
    });

    var config = { subtree: true, childList: true };
    observer.observe(document, config);
  }

  private prepareGTM() {
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    if (!w.gtag) {
      w.gtag = function () {
        w.dataLayer.push(arguments);
      };
    }
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
