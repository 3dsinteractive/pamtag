import PamTracker from '..';
import { Plugin } from '../core/plugin';

import { IAttentionItem, DisplayTimeType, AttentionType } from '../interface/attention';
import { WebAttentionPopup } from '../ui/web_attention_popup';
import { Utils } from '../utils';
import { v4 as uuidv4 } from 'uuid';

export class WebAttenTionPlugin extends Plugin {
  private previousUrl = '';
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
      if (attention.options.type == AttentionType.POPUP) {
        this.handleAsPopup(attention);
      } else {
        this.handleAsInjectContent(attention);
      }
    }
  }

  private handleAsInjectContent(attention: IAttentionItem) {
    if (attention.options.css_selector) {
      const target = document.querySelector(attention.options.css_selector);
      if (!target) {
        return;
      }

      const rndId = uuidv4().replaceAll('-', '');
      const contentHTML = `<div id="${rndId}">${attention.html}</div>`;

      if (attention.options.type == AttentionType.REPLACE) {
        target.innerHTML = contentHTML;
        this.isRendered = true;
      } else if (attention.options.type == AttentionType.APPEND) {
        target.insertAdjacentHTML('beforeend', contentHTML);
        this.isRendered = true;
      } else if (attention.options.type == AttentionType.PREPEND) {
        target.insertAdjacentHTML('afterbegin', contentHTML);
        this.isRendered = true;
      }

      const attentionDiv = document.getElementById(rndId);

      const cssElement = this.createStyleTag(attention.css);
      if (cssElement) {
        attentionDiv.appendChild(cssElement);
      }

      const customCssElement = this.createStyleTag(attention.custom_css);
      if (customCssElement) {
        attentionDiv.appendChild(customCssElement);
      }

      const scriptElement = this.createScriptTag(attention.js);
      if (scriptElement) {
        attentionDiv.appendChild(scriptElement);
      }
    }
  }

  private createDivTag(
    html?: string,
    opts?: { className?: string; id?: string }
  ): HTMLDivElement | undefined {
    if (!html?.trim()) return;
    const div = document.createElement('div');
    div.innerHTML = html;
    if (opts?.className) div.className = opts.className;
    if (opts?.id) div.id = opts.id;
    return div;
  }

  private createScriptTag(script?: string): HTMLScriptElement | undefined {
    if (!script?.trim()) return;
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.append(document.createTextNode(script));
    return scriptTag;
  }

  private createStyleTag(css?: string): HTMLStyleElement | undefined {
    if (!css?.trim()) return;
    const styleTag = document.createElement('style');
    styleTag.append(document.createTextNode(css));
    return styleTag;
  }

  private handleAsPopup(attention: IAttentionItem) {
    if (attention.options.display_after.type === DisplayTimeType.PAGE_SCROLLING) {
      window.addEventListener('scroll', this.onScrolling, true);
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

  private reset() {
    this.isRendered = false;
    window.removeEventListener('scroll', this.onScrolling, true);
    clearTimeout(this.timeoutID);
  }

  private async fetchWebAttention(pam: PamTracker) {
    const url = Utils.getPageURL();
    const contactID = pam.contactState.getContactId();
    try {
      const attention = await pam.api.getWebAttention(contactID, url);

      // const attention: IAttentionItem = {
      //   html: '<html><body><div style="background-color:#ffffff;display:flex;flex-direction:column;flex:1;" class="pam-web-attention"><div style="background-color:#ffffff;display:flex;flex-direction:row;flex:1;"><div style="flex:1;justify-content:center;"><img src="https://s3-ap-southeast-1.amazonaws.com/pam6-demo/ecom/public/2xCy3JR2fksEHM64LNVynp2xYaB.png" style="width:100%;display:flex;flex-direction:row;"></img></div></div></div></body></html> <img src="https://demox.pams.ai/pixel/2xEWH6j5YgA3OVDVQXfl4DwPVuV?media=web_attention" height="1" width="1" style="display: none;"/>',
      //   css: '',
      //   custom_css: '',
      //   js: 'console.log("debug");\nfetch("https://jsonplaceholder.typicode.com/todos/1");',
      //   options: {
      //     type: 'REPLACE',
      //     position: '',
      //     css_selector: '#box',
      //     size: {
      //       type: '',
      //       width: 0,
      //     },
      //     display_after: {
      //       intent: 'รังสิต,ดอนเมือง',
      //       intent_delay_seconds: 0,
      //       intent_watch_events: 'lead',
      //       percent: 0,
      //       second: 0,
      //       type: 'time_spend',
      //     },
      //     allow_backdrop_click: false,
      //     backdrop_opacity: 0,
      //     is_borderless: false,
      //   },
      // };
      if (Object.keys(attention).length > 0 && attention.constructor === Object) {
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
