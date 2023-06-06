import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { ICustomerConsentStatus } from "../interface/iconsent_status";

export class GoogleTagManager extends Plugin {
  static initGTM() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  static updateConsentMode(allowAnalytics: boolean, allowAds: boolean) {
    window.gtag("consent", "update", {
      ad_storage: allowAds ? "granted" : "denied",
      analytics_storage: allowAnalytics ? "granted" : "denied",
    });
  }

  static updateConsentModeFromPamConsent(consent: ICustomerConsentStatus) {
    const allowAnalytics =
      consent.tracking_permission?.analytics_cookies == true;
    const allowAds = consent.tracking_permission?.marketing_cookies == true;
    GoogleTagManager.updateConsentMode(allowAnalytics, allowAds);
  }

  override initPlugin(pam: PamTracker): void {
    pam.hook.onStartup((config): Promise<void> => {
      GoogleTagManager.initGTM();
      return;
    });

    if (pam.config.gtmConsentMode === true) {
      pam.hook.onPostTracking("*", (payload, result) => {
        if (result.consent_id) {
          const allowAnalytics =
            payload.form_fields._allow_analytics_cookies == true;
          const allowAds = payload.form_fields._allow_marketing_cookies == true;
          GoogleTagManager.updateConsentMode(allowAnalytics, allowAds);
        }
      });
    }
  }
}
