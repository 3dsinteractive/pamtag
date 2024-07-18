import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { ICustomerConsentStatus } from "../interface/iconsent_status";
import { ConsentPopup } from "../ui/consent_popup";
import { CookieConsentBatUI } from "../ui/cookie_consent_bar";
import { GoogleTagManager } from "./google_tag_manager";
export class CookieConsentPlugin extends Plugin {
  private pam: PamTracker;
  private cookieConsentBar?: CookieConsentBatUI;
  private consentPopup?: ConsentPopup;
  private allowTracking = false;

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;
    this.cookieConsentBar = new CookieConsentBatUI(this.pam);

    this.cookieConsentBar.onShow = () => {
      this.pam.config.consentBarAdpter?.onShow?.(this);
    };

    this.cookieConsentBar.onHide = () => {
      this.pam.config.consentBarAdpter?.onHide?.(this);
    };

    this.consentPopup = new ConsentPopup(pam);
    this.consentPopup.attachShadowDom(true);

    this.consentPopup.onSaveConfig = async (consentMessage) => {
      this.pam.submitConsent(consentMessage);
      this.cookieConsentBar.removeAllChild();
    };

    this.cookieConsentBar.onOpenMoreInfo = (consentMessage) => {
      this.consentPopup.show(consentMessage);
    };

    pam.hook.onPostTracking("allow_consent", async (payload, result) => {
      await this.checkConsentPermission();
    });

    pam.hook.onPreTracking("*", (payload) => {
      if (
        payload.event != "allow_consent" &&
        payload.event != "login" &&
        payload.event != "logout"
      ) {
        if (pam.config.block_events_if_no_consent === true) {
          if (!this.allowTracking) {
            payload.cancel = true;
            return payload;
          }
        }
        return payload;
      }

      if (payload.event == "allow_consent") {
        if (!pam.config.publicDBAlias) {
          window.localStorage.setItem(
            "offline_consent",
            JSON.stringify(payload)
          );
          window.localStorage.setItem(
            "offline_consent_date",
            new Date().toString()
          );
          payload.cancel = true;
          return payload;
        }
      }

      return payload;
    });

    pam.hook.onStartup(async (config) => {
      GoogleTagManager.initGTM();
      const permissionStatus = await this.checkConsentPermission();
      if (permissionStatus && config.gtmConsentMode) {
        GoogleTagManager.updateConsentModeFromPamConsent(permissionStatus);
      }
    });
  }

  private async renderConsentBar(consentMessageId: string) {
    const offlineConsentDate = window.localStorage.getItem(
      "offline_consent_date"
    );

    if (this.pam.config.publicDBAlias == "" && offlineConsentDate) {
      const date = new Date(offlineConsentDate);
      const now = new Date();
      const timeDifference = now.getTime() - date.getTime();
      const dayDifference = timeDifference / (1000 * 60 * 60 * 24);
      if (dayDifference < 30) {
        return;
      }
    }

    const consentMessage = await this.pam.loadConsentDetail(consentMessageId);

    this.cookieConsentBar.show(consentMessage);
  }

  setContainerDOM(ele: HTMLElement) {
    this.cookieConsentBar.setContainerDOM(ele);
  }

  private async checkConsentPermission(): Promise<ICustomerConsentStatus | null> {
    const consentMessageId = this.pam.config.trackingConsentMessageId;
    const contactId = this.pam.contactState.getContactId();

    if (contactId) {
      let status: ICustomerConsentStatus = undefined;

      try {
        status = await this.pam.api.loadConsentStatus(
          contactId,
          consentMessageId
        );
      } catch (e) {}

      if (
        status &&
        status.tracking_permission &&
        status.tracking_permission.preferences_cookies === true
      ) {
        this.allowTracking = true;
      } else {
        this.allowTracking = false;
      }

      if (this.pam.config.displayCookieConsentBarOnStartup === true) {
        const showConsentBar = status?.need_consent_review ?? true;
        if (showConsentBar) {
          this.renderConsentBar(consentMessageId);
        } else {
          this.cookieConsentBar.destroy();
          this.consentPopup.destroy();
        }
      }

      return status;
    } else {
      if (this.pam.config.displayCookieConsentBarOnStartup === true) {
        this.renderConsentBar(consentMessageId);
      } else {
        this.cookieConsentBar.destroy();
        this.consentPopup.destroy();
      }
    }
    return;
  }
}
