import PamTracker from "..";
import { Plugin } from "../core/plugin";

// utm_source = Identifies which site or advertising campaign the traffic came from
// utm_medium =	Identifies what type of link was used, such as email, CPC, or banner
// utm_campaign =	Identifies a specific product promotion or strategic campaign
// utm_term =	Identifies the keywords associated with a paid search ad
// utm_content = Identifies what specific piece of content was clicked on, such as a particular ad or link within an email
interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export class UTMPlugin extends Plugin {
  private minutesToDays(minutes: number): number {
    const minutesInDay = 1440; // 24 hours x 60 minutes
    const days = minutes / minutesInDay;
    return days;
  }

  private extractUtmParams(url: string): UtmParams {
    const utmParams: UtmParams = {};
    const urlParams = new URLSearchParams(url);

    utmParams.source = urlParams.get("utm_source");
    utmParams.medium = urlParams.get("utm_medium");
    utmParams.campaign = urlParams.get("utm_campaign");
    utmParams.term = urlParams.get("utm_term");
    utmParams.content = urlParams.get("utm_content");

    return utmParams;
  }

  private readUTMFromCookie(pam: PamTracker): UtmParams {
    const utmParams: UtmParams = {};

    utmParams.source = pam.utils.getCookie("utm_source");
    utmParams.medium = pam.utils.getCookie("utm_medium");
    utmParams.campaign = pam.utils.getCookie("utm_campaign");
    utmParams.term = pam.utils.getCookie("utm_term");
    utmParams.content = pam.utils.getCookie("utm_content");

    return utmParams;
  }

  private saveUTMToCookie(pam: PamTracker) {
    const utm = this.extractUtmParams(window.location.href);

    const cookieExpireInDay = this.minutesToDays(
      pam.config.sessionExpireTimeMinutes
    );

    if (utm.source) {
      pam.utils.setCookie("utm_source", utm.source, cookieExpireInDay);
    }
    if (utm.medium) {
      pam.utils.setCookie("utm_medium", utm.medium, cookieExpireInDay);
    }
    if (utm.campaign) {
      pam.utils.setCookie("utm_campaign", utm.campaign, cookieExpireInDay);
    }
    if (utm.term) {
      pam.utils.setCookie("utm_term", utm.term, cookieExpireInDay);
    }
    if (utm.content) {
      pam.utils.setCookie("utm_content", utm.content, cookieExpireInDay);
    }
  }

  override initPlugin(pam: PamTracker): void {
    pam.hook.onPreTracking("*", (p) => {
      this.saveUTMToCookie(pam);

      const utm = this.readUTMFromCookie(pam);
      if (utm.source) {
        p.form_fields.utm_source = utm.source;
      }
      if (utm.medium) {
        p.form_fields.utm_medium = utm.medium;
      }
      if (utm.campaign) {
        p.form_fields.utm_campaign = utm.campaign;
      }
      if (utm.term) {
        p.form_fields.utm_term = utm.term;
      }
      if (utm.content) {
        p.form_fields.utm_content = utm.content;
      }
      return p;
    });
  }
}
