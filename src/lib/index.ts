import IConfig from "./interface/iconfig";
import { PamAPI } from "./api";
import { QueueManager, RequestJob } from "./queue_manager";
import { ITrackerResponse } from "./interface/itracker_response";
import { ConsentMessage } from "./interface/consent_message";
import { Utils } from "./utils";
import { Hook } from "./core/hook";
import { PluginRegistration } from "./plugins/index";
import { ContactStateManager } from "./contact_state_manager";
import { ConsentPopup } from "./ui/consent_popup";
import { PopupConsentResult } from "./interface/popup_consent_result";

class PamTracker {
  config: IConfig;
  api: PamAPI;
  contactState: ContactStateManager;
  hook = new Hook();
  utils = new Utils();
  ready = false;

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

      console.log("POST", JSON.parse(JSON.stringify(events)));

      let useSameContact = true;
      if (events.length > 0 && events[0]._contact_id) {
        useSameContact = false;
      }

      const response = await this.api.postTrackers(useSameContact, events);

      for (const i in response.results) {
        const r = response.results[i];
        const e = events[i];
        let evt = "";

        if (r.hasOwnProperty("event")) {
          evt = e.event;
        } else {
          evt = "__error";
        }
        this.hook.dispatchPostTracking(evt, e, r);
      }

      return response.results;
    }

    return [];
  });

  constructor(config: IConfig) {
    this.createGetPamFunction();
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

  private createGetPamFunction() {
    const w = window as any;
    w.pam = this;
    w.getPam = function () {
      return new Promise(function (resolve) {
        if (w.pam && w.pam.ready) {
          resolve(w.pam);
          return;
        }
        var intervalId = setInterval(function () {
          if (w.pam !== null && typeof w.pam !== "undefined" && w.pam.ready) {
            clearInterval(intervalId);
            resolve(w.pam);
          }
        }, 50);
      });
    };
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

    const plugins = PluginRegistration.getPlugins(config);
    for (const i in plugins) {
      plugins[i].initPlugin(this);
    }

    // Hook StartUp
    this.hook.dispatchOnStartup(config);
    this.ready = true;
  }

  buildEventPayload(job: RequestJob<ITrackerResponse>) {
    const payload = this.api.getDefaultPayload();
    payload.event = job.event;

    let form_fields = { ...job.data };
    form_fields._consent_message_id = job.trackingConsentMessageId;

    if (job.cookieLess === true) {
      form_fields._cookie_less = true;
    }

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
    flushEventBefore: boolean = false,
    cookieLess: boolean = false
  ) {
    const job: RequestJob<ITrackerResponse> = {
      event: event,
      trackingConsentMessageId: this.config.trackingConsentMessageId,
      data: payload,
      flushEventBefore: flushEventBefore,
      cookieLess: cookieLess,
    };

    return this.queueManager.enqueueJob(job);
  }

  async cleanPamCookies() {
    this.hook.dispatchOnClean(this.config);
  }

  async submitConsent(
    consent: ConsentMessage,
    flushEventBefore: boolean = false,
    cookieLess: boolean = false
  ) {
    const job: RequestJob<ITrackerResponse> = {
      event: "allow_consent",
      trackingConsentMessageId: consent.data.consent_message_id,
      data: consent.buildFormField(),
      flushEventBefore: flushEventBefore,
      cookieLess,
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

  async openConsentPopup(
    consentMessageId: string
  ): Promise<PopupConsentResult> {
    return new Promise<PopupConsentResult>(async (resolve, reject) => {
      const consentMessage = await this.loadConsentDetail(consentMessageId);
      const popup = new ConsentPopup(this);
      popup.attachShadowDom(true);
      popup.show(consentMessage);
      popup.onClose = async () => {
        popup.destroy();
        reject(new Error("User Not Allow Consent"));
      };

      popup.onSaveConfig = async (consentMessage) => {
        popup.destroy();
        try {
          const result = await this.submitConsent(consentMessage);
          resolve({
            consent: consentMessage,
            response: result,
          });
        } catch (e: any) {
          reject(e);
        }
      };
    });
  }
}

export default PamTracker;
