import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { Utils } from "../utils";

export class AffiliateAndRedirectId extends Plugin {
  pam: PamTracker;

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;
    this.saveRedirectIDToCookie(pam);

    pam.hook.onPreTracking("*", async (p) => {
      this.saveRedirectIDToCookie(pam);

      const affiliate = await Promise.resolve(Utils.getCookie("affiliate"));
      const redirect_id = await Promise.resolve(Utils.getCookie("redirect_id"));
      if (redirect_id) {
        p.form_fields._redirect_id = redirect_id;
      }
      if (affiliate) {
        p.form_fields.affiliate = affiliate;
      }

      try {
        let url = new URL(p.page_url);
        if (redirect_id) {
          url.searchParams.set("redirect_id", redirect_id);
        }
        if (affiliate) {
          url.searchParams.set("affiliate", affiliate);
        }

        p.page_url = url.toString();
      } catch (e: any) {}

      return p;
    });
  }

  private saveRedirectIDToCookie(pam: PamTracker) {
    const pageURL = Utils.getPageURL();
    const urlObject = new URL(pageURL);
    const redirect_id = urlObject.searchParams.get("redirect_id");
    if (redirect_id) {
      // Default is 1 hours
      const cookieExpireHours =
        (pam.config.sessionExpireTimeMinutes ?? 60) / 60;
      Utils.setCookie("redirect_id", redirect_id, cookieExpireHours);
    }

    const affiliate = urlObject.searchParams.get("affiliate");
    if (affiliate) {
      // Default is 1 hours
      const cookieExpireHours =
        (pam.config.sessionExpireTimeMinutes ?? 60) / 60;
      Utils.setCookie("affiliate", affiliate, cookieExpireHours);
    }
  }
}
