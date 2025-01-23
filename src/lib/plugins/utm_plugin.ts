import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { Utils } from "../utils";

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
  private extractUtmParams(url: string): UtmParams {
    const urlObject = new URL(url);
    const utmParams = {
      source: urlObject.searchParams.get("utm_source"),
      medium: urlObject.searchParams.get("utm_medium"),
      campaign: urlObject.searchParams.get("utm_campaign"),
      term: urlObject.searchParams.get("utm_term"),
      content: urlObject.searchParams.get("utm_content"),
    };
    return utmParams;
  }

  private async readUTMFromCookie(pam: PamTracker): Promise<UtmParams> {
    const utmParams: UtmParams = {};

    utmParams.source = await Promise.resolve(Utils.getCookie("utm_source"));
    utmParams.medium = await Promise.resolve(Utils.getCookie("utm_medium"));
    utmParams.campaign = await Promise.resolve(Utils.getCookie("utm_campaign"));
    utmParams.term = await Promise.resolve(Utils.getCookie("utm_term"));
    utmParams.content = await Promise.resolve(Utils.getCookie("utm_content"));

    return utmParams;
  }

  private saveUTMToCookie(pam: PamTracker) {
    const utm = this.extractUtmParams(Utils.getPageURL());

    // Default is 1 hours
    const cookieExpireHours = pam.config.sessionExpireTimeMinutes / 60;

    if (utm.source) {
      Utils.setCookie("utm_source", utm.source, cookieExpireHours);
    }
    if (utm.medium) {
      Utils.setCookie("utm_medium", utm.medium, cookieExpireHours);
    }
    if (utm.campaign) {
      Utils.setCookie("utm_campaign", utm.campaign, cookieExpireHours);
    }
    if (utm.term) {
      Utils.setCookie("utm_term", utm.term, cookieExpireHours);
    }
    if (utm.content) {
      Utils.setCookie("utm_content", utm.content, cookieExpireHours);
    }
  }

  private margeUTM(highPriority: any, lowPriority: any): UtmParams {
    const merged = { ...highPriority };

    for (const key in lowPriority) {
      if (lowPriority.hasOwnProperty(key)) {
        const highPriorityValue = highPriority[key];
        const lowPriorityValue = lowPriority[key];

        if (
          highPriorityValue === null ||
          highPriorityValue === undefined ||
          highPriorityValue === lowPriorityValue
        ) {
          merged[key] = lowPriorityValue;
        }
      }
    }

    return merged;
  }

  override initPlugin(pam: PamTracker) {
    this.saveUTMToCookie(pam);

    pam.hook.onPreTracking("*", async (p) => {
      this.saveUTMToCookie(pam);

      try {
        let url = new URL(p.page_url);

        const utmInCookie = await this.readUTMFromCookie(pam);
        const utmInURL = this.extractUtmParams(Utils.getPageURL());

        // Merge UTM from cookie and URL but UTM from URL is higher priority
        const utm = this.margeUTM(utmInURL, utmInCookie);

        if (utm.source) {
          url.searchParams.set("utm_source", utm.source);
          p.form_fields.utm_source = utm.source;
        }

        if (utm.medium) {
          url.searchParams.set("utm_medium", utm.medium);
          p.form_fields.utm_medium = utm.medium;
        }
        if (utm.campaign) {
          url.searchParams.set("utm_campaign", utm.campaign);
          p.form_fields.utm_campaign = utm.campaign;
        }

        if (utm.term) {
          url.searchParams.set("utm_term", utm.term);
          p.form_fields.utm_term = utm.term;
        }

        if (utm.content) {
          url.searchParams.set("utm_content", utm.content);
          p.form_fields.utm_content = utm.content;
        }

        p.page_url = url.toString();
      } catch (e: any) {}

      return p;
    });
  }
}
