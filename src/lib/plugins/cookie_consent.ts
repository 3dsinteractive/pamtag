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
    this.cookieConsentBar.attachShadowDom(true);

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
        if (!this.allowTracking) {
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
    const consentMessage = await this.pam.loadConsentDetail(consentMessageId);
    this.cookieConsentBar.show(consentMessage);
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
