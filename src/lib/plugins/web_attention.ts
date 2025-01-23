import PamTracker from "..";
import { Plugin } from "../core/plugin";

import {
  IAttentionItem,
  DisplayTimeType,
  AttentionType,
} from "../interface/attention";
import { WebAttentionPopup } from "../ui/web_attention_popup";
import { Utils } from "../utils";

export class WebAttenTionPlugin extends Plugin {
  private previousUrl = "";
  private isRendered = false;
  private attention: IAttentionItem;
  private pam: PamTracker;
  private timeoutID?: NodeJS.Timeout;
  private shadowDom: WebAttentionPopup;

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;
    this.shadowDom = new WebAttentionPopup(pam);
    this.shadowDom.attachShadowDom(true);

    pam.hook.onStartup(async (config) => {
      var observer = new MutationObserver((mutations) => {
        const url = Utils.getPageURL();
        if (url !== this.previousUrl) {
          this.reset();
          this.previousUrl = url;
          this.fetchWebAttention(pam);
        }
      });
      var cfg = { subtree: true, childList: true };
      observer.observe(document, cfg);
    });
  }

  private initAttention(attention: IAttentionItem) {
    if (!this.isRendered) {
      this.attention = attention;

      if (
        attention.options.display_after.type === DisplayTimeType.PAGE_SCROLLING
      ) {
        window.addEventListener("scroll", this.onScrolling, true);
        return;
      }

      let delayTime = 0;
      if (attention.options.display_after.type === DisplayTimeType.TIME_SPEND) {
        const sec = Number(attention.options.display_after.second);
        if (isNaN(sec)) {
          delayTime = 0;
        } else {
          delayTime = sec * 1000;
        }
        this.isRendered = true;
      }

      this.timeoutID = setTimeout(() => {
        this.render();
      }, delayTime);
    }
  }

  private reset() {
    this.isRendered = false;
    window.removeEventListener("scroll", this.onScrolling, true);
    clearTimeout(this.timeoutID);
  }

  private async fetchWebAttention(pam: PamTracker) {
    const url = Utils.getPageURL();
    const contactID = pam.contactState.getContactId();
    try {
      const attention = await pam.api.getWebAttention(contactID, url);
      if (
        Object.keys(attention).length > 0 &&
        attention.constructor === Object
      ) {
        this.initAttention(attention);
      } else {
        this.shadowDom.destroy();
      }
    } catch (e) {}
  }

  private onScrolling = () => {
    const percent = this.attention.options.display_after.percent || 0;
    if (Utils.getScrollPercent() >= percent && !this.isRendered) {
      this.render();
    }
  };

  private render() {
    this.shadowDom.show(this.attention);
  }
}
