import PamTracker from "..";
import { ConsentMessage } from "../interface/consent_message";
import ShadowDom from "../ui/shadow_dom";
import { Utils } from "../utils";
import htmlContent from "./html/consent_bar_template.html";

export class CookieConsentBatUI extends ShadowDom {
  onOpenMoreInfo?: (consentMessage: ConsentMessage) => void;
  consentMessage: ConsentMessage;

  onShow?: () => void;
  onHide?: () => void;

  show(consentMessage: ConsentMessage) {
    this.onShow?.();

    this.consentMessage = consentMessage;
    let alpha = 1;
    if (
      consentMessage.data.style_configuration.bar_background_opacity_percentage
    ) {
      alpha =
        consentMessage.data.style_configuration
          .bar_background_opacity_percentage / 100;
    }

    const backgroundColor = Utils.applyOpacityToColor(
      consentMessage.data.style_configuration.bar_background_color,
      alpha
    );

    const variables = {
      BG_COLOR: backgroundColor,
      SHORT_TITLE: this.getText(consentMessage.data.setting.display_text),
      BUTTON_TEXT: this.getText(consentMessage.data.setting.accept_button_text),
      BUTTON_BG_COLOR:
        consentMessage.data.style_configuration.button_background_color,
      BUTTON_TEXT_COLOR:
        consentMessage.data.style_configuration.button_text_color,
      BAR_TEXT_COLOR: consentMessage.data.style_configuration.bar_text_color,
      MORE_INFO_TEXT: this.getText(
        consentMessage.data.setting.more_info.display_text
      ),
    };

    const div = this.addHtmlTemplate(htmlContent, variables);

    const moreInfo = div.getElementsByClassName("more-info")[0];
    moreInfo.addEventListener("click", () => {
      if (
        consentMessage.data.setting.more_info.is_custom_url_enabled === true &&
        consentMessage.data.setting.more_info.custom_url
      ) {
        this.openMoreInfoLink(consentMessage);
      } else {
        this.openMoreInfoPopup(consentMessage);
      }
    });

    const allowAllButton = div.getElementsByClassName(
      "consent-allow-all-btn"
    )[0];
    allowAllButton.addEventListener("click", () => {
      this.allowAll(consentMessage);
    });

    const closeButton = div.getElementsByClassName("x-icon")[0];
    closeButton.addEventListener("click", () => {
      this.removeAllChild();
      this.onHide?.();
    });
  }

  private allowAll(consentMessage: ConsentMessage) {
    consentMessage.allowAll();
    this.pam.submitConsent(consentMessage);
    this.removeAllChild();
    this.onHide?.();
  }

  private openMoreInfoPopup(consentMessage: ConsentMessage) {
    this.onOpenMoreInfo(this.consentMessage);
  }

  private openMoreInfoLink(consentMessage: ConsentMessage) {
    window.open(
      this.getText(consentMessage.data.setting.more_info.custom_url),
      "_blank"
    );
  }

  private getText(obj: any) {
    return Utils.localeText(obj, this.pam.config.preferLanguage);
  }
}
