import PamTracker from "..";
import { Plugin } from "../core/plugin";
//import htmlContent from "./html/cookie_consent_bar.html";

export class CookieConsentPlugin extends Plugin {
  private pam: PamTracker;
  private shadowHost?: HTMLElement;
  private shadowRoot?: ShadowRoot;

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;

    pam.hook.onStartup(async (config) => {
      this.checkConsentPermission();
    });
  }

  private getShadowHost() {
    if (this.shadowHost) {
      return this.shadowHost;
    }

    const shadowHostId = "pam_cookie_consent_bar";

    this.shadowHost = document.getElementById(shadowHostId);
    if (!this.shadowHost) {
      this.shadowHost = window.document.createElement("div");
      this.shadowHost.id = shadowHostId;
      const body = window.document.querySelector("body")!;
      body.insertBefore(this.shadowHost, body.childNodes[0] || null);
    }
    return this.shadowHost;
  }

  private getShadowRoot() {
    if (this.shadowRoot) {
      return this.shadowRoot;
    }

    const host = this.getShadowHost();
    this.shadowRoot = host.attachShadow({ mode: "open" });
    return this.shadowRoot;
  }

  private async renderConsentBar(consentMessageId: string) {
    const consentMessage = await this.pam.loadConsentDetail(consentMessageId);

    const shadowRoot = this.getShadowRoot();
    const div = document.createElement("div");
    //div.innerHTML = htmlContent;
    //console.log(htmlContent);
    shadowRoot.appendChild(div);
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
