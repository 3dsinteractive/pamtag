import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { Utils } from "../utils";

export class FBPixel extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onPreTracking("*", async (p) => {
      const fbp = await Promise.resolve(Utils.getCookie("_fbp"));
      const fbc = await Promise.resolve(Utils.getCookie("_fbc"));
      if (fbp) {
        p.form_fields._fbp = fbp;
      }
      if (fbc) {
        p.form_fields._fbc = fbc;
      }
      return p;
    });

    if (pam.config.facebookConsentMode === true) {
      pam.hook.onPostTracking("*", (payload, result) => {
        if (result.consent_id) {
          const allow = payload.form_fields._allow_social_media_cookies == true;
          FBPixel.updateConsentMode(allow);
        }
      });
    }
  }

  static updateConsentMode(allow: boolean) {
    if (typeof window.fbq != "undefined") {
      window.fbq("consent", allow ? "grant" : "revoke");
    }
  }
}
