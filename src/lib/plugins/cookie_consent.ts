import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { ConsentPopup } from "../ui/consent_popup";
import { CookieConsentBatUI } from "../ui/cookie_consent_bar";

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

    this.consentPopup.onSaveConfig = (consentMessage) => {
      this.pam.submitConsent(consentMessage);
      this.cookieConsentBar.removeAllChild();
    };

    this.cookieConsentBar.onOpenMoreInfo = (consentMessage) => {
      this.consentPopup.show(consentMessage);
    };

    pam.hook.onStartup(async (config) => {
      this.checkConsentPermission();
    });
  }

  private async renderConsentBar(consentMessageId: string) {
    const consentMessage = await this.pam.loadConsentDetail(consentMessageId);
    this.cookieConsentBar.show(consentMessage);
  }

  private async checkConsentPermission() {
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
        }
      }
    } else {
      if (this.pam.config.displayCookieConsentBarOnStartup === true) {
        this.renderConsentBar(consentMessageId);
      }
    }
  }
}
