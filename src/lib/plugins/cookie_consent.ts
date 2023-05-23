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
      const status = await this.pam.api.loadConsentStatus(
        contactId,
        consentMessageId
      );
      if (this.pam.config.displayCookieConsentBarOnStartup === true) {
        if (status.need_consent_review) {
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
