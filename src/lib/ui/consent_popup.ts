import PamTracker from "..";
import {
  IConsentDetailByType,
  IConsentPermission,
} from "../interface/consent_message";
import { ConsentMessage } from "../interface/consent_message";
import ShadowDom from "../ui/shadow_dom";
import { Utils } from "../utils";
import htmlContent from "./html/consent_popup.html";

export class ConsentPopup extends ShadowDom {
  private consentMessage: ConsentMessage;
  private popupDom: HTMLElement;
  private currentFullDescItem = -1;

  readonly: boolean = false;

  onSaveConfig: (consentMessage: ConsentMessage) => Promise<void>;
  onClose: () => Promise<void>;

  getTextFromPreferLang(obj: any) {
    const preferredLanguage = this.pam.config.preferLanguage;
    if (obj.hasOwnProperty(preferredLanguage)) {
      return obj[preferredLanguage];
    }

    for (const language in obj) {
      if (obj.hasOwnProperty(language)) {
        return obj[language];
      }
    }
    return "";
  }

  show(consentMessage: ConsentMessage) {
    this.consentMessage = consentMessage;

    const primaryColor =
      consentMessage.data.style_configuration.consent_detail.primary_color;

    const secondaryColor =
      consentMessage.data.style_configuration.consent_detail.secondary_color;

    const textColor =
      consentMessage.data.style_configuration.consent_detail.text_color;

    const buttonTextColor =
      consentMessage.data.style_configuration.consent_detail.button_text_color;
    const popupMainIcon =
      consentMessage.data.style_configuration.consent_detail.popup_main_icon;

    const consentTypeHeader =
      consentMessage.data.consent_message_type === "tracking_type"
        ? "Tracking Consent"
        : "Contacting Consent";

    const descriptions = this.consentMessage.permission.map((p) => {
      const preferLang = this.pam.config.preferLanguage;
      if (p.isFullDescriptionEnabled) {
        const txt = this.getTextFromPreferLang(p.fullDescription);
        if (txt.length > 0) {
          return txt;
        }
      }
      const txt = this.getTextFromPreferLang(p.briefDescription);
      return txt;
    });

    const variables = {
      PRIMARY_COLOR: primaryColor,
      SECONDARY_COLOR: secondaryColor,
      POPUP_MAIN_ICON: popupMainIcon,
      CONSENT_TYPE: consentTypeHeader,
      TEXT_COLOR: textColor,
      BUTTON_TEXT_COLOR: buttonTextColor,
      PERMISSIONS_COUNT: this.consentMessage.permission.length,
      PERMISSIONS: this.consentMessage.permission,
      PERMISSIONS_DESC: descriptions,
    };

    this.popupDom = this.addHtmlTemplate(htmlContent, variables);
    this.popupDom
      .getElementsByClassName("x-icon")[0]
      .addEventListener("click", () => {
        this.removeAllChild();
        if (this.onClose) {
          this.onClose();
        }
      });
    this.initTabEvent(this.popupDom);
    this.setDescriptioText(this.popupDom);
    this.initPermissionSwitchEvent(this.popupDom);
    this.initFullDetailButton(this.popupDom);
    this.initSaveButtonEvent(this.popupDom);
    this.hideOrShowActionButton(this.popupDom);
  }

  hideOrShowActionButton(popupDom: HTMLElement) {
    if (this.readonly) {
      const elements = popupDom.getElementsByClassName(
        "switch-on-off"
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elements.length; i++) {
        elements[i].style.visibility = "hidden";
      }

      let a = popupDom.getElementsByClassName(
        "save-btn"
      ) as HTMLCollectionOf<HTMLElement>;
      a[0].style.visibility = "hidden";
      let b = popupDom.getElementsByClassName(
        "accept-all-btn"
      ) as HTMLCollectionOf<HTMLElement>;
      b[0].style.visibility = "hidden";
    } else {
      const elements = popupDom.getElementsByClassName(
        "switch-on-off"
      ) as HTMLCollectionOf<HTMLElement>;

      for (var i = 0; i < elements.length; i++) {
        elements[i].style.visibility = "visible";
      }

      let a = popupDom.getElementsByClassName(
        "save-btn"
      ) as HTMLCollectionOf<HTMLElement>;
      a[0].style.visibility = "visible";
      let b = popupDom.getElementsByClassName(
        "accept-all-btn"
      ) as HTMLCollectionOf<HTMLElement>;
      b[0].style.visibility = "visible";
    }
  }

  initSaveButtonEvent(popupDom: HTMLElement) {
    popupDom
      .getElementsByClassName("save-btn")[0]
      .addEventListener("click", (e) => {
        if (this.onSaveConfig) {
          this.onSaveConfig(this.consentMessage);
        }
        this.removeAllChild();
      });
    popupDom
      .getElementsByClassName("accept-all-btn")[0]
      .addEventListener("click", (e) => {
        this.consentMessage.allowAll();
        if (this.onSaveConfig) {
          this.onSaveConfig(this.consentMessage);
        }
        this.removeAllChild();
      });
  }

  private initFullDetailButton(popupDom: HTMLElement) {
    const list = popupDom.getElementsByClassName("full-version-button");
    for (let i = 0; i < list.length; i++) {
      list[i].addEventListener("click", (e) => {
        const btn = e.target as HTMLElement;
        const index = Number(btn.dataset.index);
        this.currentFullDescItem = index;
        const consent = this.consentMessage.permission[index];

        popupDom
          .getElementsByClassName("consent-settings")[0]
          .classList.add("gone");

        popupDom
          .getElementsByClassName("consent-settings-action-bar")[0]
          .classList.add("gone");

        popupDom
          .getElementsByClassName("consent-full-desc")[0]
          .classList.remove("gone");
        popupDom.getElementsByClassName("consent-full-desc-body")[0].innerHTML =
          this.getText(consent.fullDescription);

        popupDom
          .getElementsByClassName("consent-full-desc-action-bar")[0]
          .classList.remove("gone");
      });
    }

    //Bak BTN
    popupDom
      .getElementsByClassName("back-btn")[0]
      .addEventListener("click", (e) => {
        popupDom
          .getElementsByClassName("consent-settings")[0]
          .classList.remove("gone");

        popupDom
          .getElementsByClassName("consent-settings-action-bar")[0]
          .classList.remove("gone");

        popupDom
          .getElementsByClassName("consent-full-desc")[0]
          .classList.add("gone");
        popupDom
          .getElementsByClassName("consent-full-desc-action-bar")[0]
          .classList.add("gone");
      });
  }

  private initPermissionSwitchEvent(div: HTMLElement) {
    for (let i in this.consentMessage.permission) {
      const switchs = div.querySelectorAll(`.checkbox-${i}`);
      switchs.forEach((sw) => {
        sw.addEventListener("change", (e: any) => {
          const index = Number(e.target.dataset.index);
          const checked = e.target.checked;
          this.consentMessage.permission[index].allow = checked;
          const icon = this.popupDom.getElementsByClassName(
            `tab-icon-${index}`
          )[0] as HTMLElement;
          if (e.target.checked) {
            icon.classList.remove("hide");
          } else {
            icon.classList.add("hide");
          }
          // set all switch toggle
          div
            .querySelectorAll(`.checkbox-${index}`)
            .forEach((sw: HTMLInputElement) => {
              if (checked !== sw.checked) {
                sw.checked = checked;
              }
            });
        });
      });
    }
  }

  private setDescriptioText(div: HTMLElement) {
    for (let i in this.consentMessage.permission) {
      const p = this.consentMessage.permission[i];

      div.getElementsByClassName(`title-${i}`)[0].innerHTML = p.name;
      div.getElementsByClassName(`desc-${i}`)[0].innerHTML = this.getText(
        p.briefDescription
      );
      if (p.isFullDescriptionEnabled) {
        div.getElementsByClassName(`fulldesc-${i}`)[0].classList.remove("hide");
      } else {
        div.getElementsByClassName(`fulldesc-${i}`)[0].classList.add("hide");
      }
    }

    div.querySelector(".desc-mobile-0").classList.add("active");
  }

  private initTabEvent(div: HTMLElement) {
    const tabList = div.querySelectorAll(".tab-item");
    const tabContentList = div.querySelectorAll(".tab-content");
    let focusTab: HTMLElement;
    let focusTabContent: HTMLElement;
    for (var i = 0; i < tabList.length; i++) {
      const tab = tabList[i] as HTMLElement;
      if (i === 0) {
        focusTab = tab;
        tab.classList.add("active");
        focusTabContent = tabContentList[i] as HTMLElement;

        tabContentList[i].classList.add("tab-content-active");
      }
      tab.addEventListener("click", (e) => {
        if (focusTab) {
          focusTab.classList.remove("active");
          focusTabContent.classList.remove("tab-content-active");
        }
        focusTab = e.target as HTMLElement;
        focusTab.classList.add("active");
        let index = Number(focusTab.dataset.tabnum);
        focusTabContent = tabContentList[index] as HTMLElement;
        focusTabContent.classList.add("tab-content-active");
        //-- Show Full Desc in mobile
        div.querySelectorAll(".desc-mobile-container").forEach((e) => {
          e.classList.remove("active");
        });

        div.querySelector(`.desc-mobile-${index}`).classList.add("active");
      });
    }
  }

  private getText(obj: any) {
    return Utils.localeText(obj, this.pam.config.preferLanguage);
  }
}
