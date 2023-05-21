import PamTracker from "..";
import { Plugin } from "../core/plugin";

import {
  IAttentionItem,
  DisplayTimeType,
  AttentionType,
} from "../interface/attention";
import { WebAttentionPopup } from "../ui/web_attention_popup";

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
        const url = pam.utils.getPageURL();
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
    //const url = pam.utils.getPageURL();
    //const contactID = pam.contactState.getContactId();
    //const attention = await pam.api.getWebAttention(contactID, url);

    const attention: IAttentionItem = {
      html: '<html><body><div style="background-color:#ffffff;display:flex;flex-direction:column;flex:1;" class="pam-web-attention"><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="flex-grow:inherit;background-color:#f0f0f0;"><h2 style="margin:0px;"><span align="center" style="width:100%;display:inline-block;font-size:1.5rem;line-height:1.3;"><span font-family="Impact" style="display:inline-block;font-size:1rem;line-height:1.3;color:#0047b2;">เตรียมช้อปกับแบรนด์ดังมากมาย วันที่ 8.8 เร็วๆ นี้</span></span></h2></div></div><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="flex:1;justify-content:center;"><img src="https://s3-ap-southeast-1.amazonaws.com/pam4-sansiri/ecom/public/2CqFnJa7w52KYvrQTEafRFYpSRy.jpg" style="width:100%;display:flex;flex-direction:row;"></img></div></div><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="background-color:#f0f0f0;flex:1;"><div style="height:20px;"></div></div></div><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="display:flex;background-color:#f0f0f0;flex:1;justify-content:center;"><a href="https://stgx.pams.ai/r/2Px9moaup0dO8p3zVwXqC1arJqX"><button style="background-color:#1f27f9;border:1px solid #ffffff;border-radius:1px;font-family:Courier-New;font-size:20px;color:#ffffff;">OK</button></a></div></div><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="background-color:#f0f0f0;flex:1;"><div style="height:20px;"></div></div></div></div></body></html> <img src="https://stgx.pams.ai/pixel/2Px9mlFZXp0o4fgOXS3tbPAmXcJ?media=web_attention" height="1" width="1" style="display: none;"/>',
      css: "",
      custom_css: "",
      js: "",
      options: {
        type: "POPUP",
        position: "FIXED",
        container_id: "",
        size: {
          type: "small",
          width: 0,
        },
        display_after: {
          percent: 0,
          second: 1,
          type: "time_spend",
        },
        allow_backdrop_click: true,
        backdrop_opacity: 50,
        is_borderless: true,
      },
    };

    if (Object.keys(attention).length > 0 && attention.constructor === Object) {
      this.initAttention(attention);
    }
  }

  private onScrolling = () => {
    const percent = this.attention.options.display_after.percent || 0;
    if (this.pam.utils.getScrollPercent() >= percent && !this.isRendered) {
      this.render();
    }
  };

  private render() {
    this.shadowDom.show(this.attention);
  }
}
