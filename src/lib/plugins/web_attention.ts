import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { HTTPClient } from "../httpclient";
import {
  IAttentionItem,
  DisplayTimeType,
  AttentionType,
} from "../interface/attention";

export class WebAttenTionPlugin extends Plugin {
  private previousUrl = "";
  private isRendered = false;
  private attention: IAttentionItem;
  private pam: PamTracker;
  private timeoutID?: NodeJS.Timeout;
  private shadowHost?: HTMLElement;
  private shadowRoot?: ShadowRoot;

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;

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

  private injectStyleSheet(backgroundOpacity: number) {
    // Example usage:
    const cssContent = `
      .attention-container {
        position: fixed;
        left:0;
        top:0;
        right:0;
        bottom:0;
        background: #000000cc;
        background-color: rgba(0, 0, 0, ${backgroundOpacity});
      } `;

    //create Style element
    const styleElement = document.createElement("style");
    styleElement.textContent = cssContent;

    const headElement = document.head;
    headElement.appendChild(styleElement);
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
        is_borderless: false,
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

  private getShadowHost() {
    if (this.shadowHost) {
      return this.shadowHost;
    }

    const shadowHostId = "pam_attention";

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

  private closePopup() {
    const targetElement = this.getShadowHost();
    if (targetElement) {
      targetElement.remove();
      this.shadowHost = undefined;
      this.shadowRoot == undefined;
    }
  }

  private render() {
    if (this.attention.options.type === AttentionType.POPUP) {
      const shadowHost = this.getShadowHost();
      const shadowRoot = this.getShadowRoot();

      let fixWidth = this.attention.options.size?.width ?? 0;
      if (fixWidth <= 0) {
        fixWidth = 100;
      }

      let opacity = this.attention.options.backdrop_opacity;
      if (isNaN(opacity)) {
        opacity = 0.1;
      } else {
        opacity = opacity / 100;
      }

      const cssInShadowDom = `
      .attention-body{
        disply:flex;
        position: fixed;
        overflow: auto;
        max-height: 100%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .attention-body-small{
        position: fixed;
        width: 300px;
      }
      .attention-body-medium{
        width: 600px;
      }
      .attention-body-large{
        width: 800px;
      }
      .attention-body-full{
        position: fixed;
        left:10px !important;
        top:10px !important;
        right: 10px !important;
        bottom:10px !important;;
      }
      .attention-body-custom{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${fixWidth}px;
        overflow: auto;
        max-height: 100%;
      }
      .x-icon {
        margin-left: auto;
        margin-bottom: 5px;
        position: relative;
        width: 20px;
        height: 20px;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
      }
      
      .x-icon::before {
        font-weight: 600;
        color: #999;
        content: '\\2715';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        text-align: center;
      }
      .border-popup{
        padding: 5px;
        background: #fff;
        border-radius: 10px;
      }
      `;

      this.injectStyleSheet(opacity);

      let css = this.attention.css;
      if (this.attention.custom_css) {
        css += this.attention.custom_css.replace("\n", "");
      }

      if (css) {
        const style = window.document.createElement("style");
        style.innerHTML = css;
        shadowRoot.appendChild(style);
      }

      //--CSS
      const styleElement = document.createElement("style");
      styleElement.textContent = cssInShadowDom;
      shadowRoot.appendChild(styleElement);
      //--CSS

      shadowHost.className = "attention-container";

      const xIcon = document.createElement("div");
      xIcon.className = "x-icon";
      shadowRoot.appendChild(xIcon);

      const popupContainer = document.createElement("div");
      popupContainer.classList.add(
        "attention-body",
        `attention-body-${this.attention.options.size.type}`
      );
      if (this.attention.options.is_borderless !== true) {
        popupContainer.classList.add("border-popup");
      }
      popupContainer.appendChild(xIcon);

      const popupBody = document.createElement("div");
      popupBody.innerHTML = this.attention.html;
      popupContainer.appendChild(popupBody);

      shadowRoot.appendChild(popupContainer);

      xIcon.addEventListener("click", () => {
        this.closePopup();
      });

      if (this.attention.options.allow_backdrop_click === true) {
        shadowHost.addEventListener("click", () => {
          this.closePopup();
        });
      }

      if (this.attention.js) {
        const script = window.document.createElement("script");
        const inlineScript = window.document.createTextNode(this.attention.js);
        script.appendChild(inlineScript);
        const body = document.getElementsByName("body")[0];
        body.appendChild(script);
      }
    } else if (
      this.attention.options.type === AttentionType.REPLACE ||
      AttentionType.PREPEND ||
      AttentionType.APPEND
    ) {
      //this.content = new Injection(this.ctx, this.attention);
    } else {
      return;
    }

    if (!this.isRendered) {
      this.isRendered = true;
    }
  }
}
