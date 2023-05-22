import PamTracker from "..";
import { IAttentionItem, AttentionType } from "../interface/attention";
import { ConsentMessage } from "../interface/consent_message";
import ShadowDom from "../ui/shadow_dom";
import htmlContent from "./html/web_attention.html";

export class WebAttentionPopup extends ShadowDom {
  attention?: IAttentionItem;

  show(attention: IAttentionItem) {
    this.attention = attention;

    if (attention.options.type === AttentionType.POPUP) {
      let fixedPopupWidth = attention.options.size?.width ?? 0;
      if (fixedPopupWidth <= 0) {
        fixedPopupWidth = 100;
      }

      let opacity = attention.options.backdrop_opacity;
      if (isNaN(opacity)) {
        opacity = 0.1;
      } else {
        opacity = opacity / 100;
      }
      const shadowBGColor = this.pam.utils.applyOpacityToColor(
        "#000000",
        opacity
      );

      let customCSS = attention.css;
      if (attention.custom_css) {
        customCSS += attention.custom_css.replace("\n", "");
      }

      let popupBodyClass = `attention-body-${attention.options.size.type}`;
      if (attention.options.is_borderless !== true) {
        popupBodyClass += " border-popup";
      }

      const variables = {
        SHADOW_BG_COLOR: shadowBGColor,
        FIXED_POPUP_WIDTH: fixedPopupWidth,
        CUSTOM_CSS: customCSS,
        POPUP_BODY_CLASS: popupBodyClass,
        CONTENT: attention.html,
        CUSTOM_JS: attention.js,
      };

      const div = this.addHtmlTemplate(htmlContent, variables);
      //console.log(div.innerHTML);
      const xIcon = div.getElementsByClassName("x-icon")[0];

      xIcon.addEventListener("click", () => {
        this.removeAllChild();
        this.destroy();
      });

      const container = div.getElementsByClassName("attention-container")[0];
      if (this.attention.options.allow_backdrop_click === true) {
        container.addEventListener("click", () => {
          this.removeAllChild();
        });
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
  }
}
