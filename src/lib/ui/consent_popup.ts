import PamTracker from "..";
import { IConsentDetailByType } from "../interface/consent_message";
import { ConsentMessage } from "../interface/consent_message";
import ShadowDom from "../ui/shadow_dom";
import htmlContent from "./html/consent_popup.html";

export class ConsentPopup extends ShadowDom {
  show(consentMessage: ConsentMessage) {
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

    const permissions: any[] = [];

    permissions.push(
      this.createPermissionObject(
        "Terms & Conditions",
        consentMessage.data.setting.terms_and_conditions
      )
    );

    permissions.push(
      this.createPermissionObject(
        "Privacy Overview",
        consentMessage.data.setting.privacy_overview
      )
    );

    if (consentMessage.data.setting.necessary_cookies.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Necessary Cookies",
          consentMessage.data.setting.necessary_cookies
        )
      );
    }

    if (consentMessage.data.setting.preferences_cookies.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Preferences Cookies",
          consentMessage.data.setting.preferences_cookies
        )
      );
    }

    if (consentMessage.data.setting.analytics_cookies.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Analytics Cookies",
          consentMessage.data.setting.analytics_cookies
        )
      );
    }
    if (consentMessage.data.setting.marketing_cookies.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Marketing Cookies",
          consentMessage.data.setting.marketing_cookies
        )
      );
    }
    if (consentMessage.data.setting.social_media_cookies.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Social Media Cookies",
          consentMessage.data.setting.social_media_cookies
        )
      );
    }

    if (consentMessage.data.setting.email.is_enabled) {
      permissions.push(
        this.createPermissionObject("Email", consentMessage.data.setting.email)
      );
    }

    if (consentMessage.data.setting.sms.is_enabled) {
      permissions.push(
        this.createPermissionObject("SMS", consentMessage.data.setting.sms)
      );
    }

    if (consentMessage.data.setting.line.is_enabled) {
      permissions.push(
        this.createPermissionObject("Line", consentMessage.data.setting.line)
      );
    }

    if (consentMessage.data.setting.facebook_messenger.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Facebook Messenger",
          consentMessage.data.setting.facebook_messenger
        )
      );
    }

    if (consentMessage.data.setting.push_notification.is_enabled) {
      permissions.push(
        this.createPermissionObject(
          "Push Notification",
          consentMessage.data.setting.push_notification
        )
      );
    }

    const variables = {
      PRIMARY_COLOR: primaryColor,
      SECONDARY_COLOR: secondaryColor,
      POPUP_MAIN_ICON: popupMainIcon,
      CONSENT_TYPE: consentTypeHeader,
      TEXT_COLOR: textColor,
      BUTTON_TEXT_COLOR: buttonTextColor,
      PERMISSIONS: permissions,
    };

    const div = this.addHtmlTemplate(htmlContent, variables);
    this.initTabAction(div);
  }

  private initTabAction(div: HTMLElement) {
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
        console.log(focusTabContent);
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
      });
    }
  }

  private createPermissionObject(
    name: string,
    perm: IConsentDetailByType
  ): any {
    return {
      name: name,
      consent: perm,
      shortDesc: this.getText(perm.brief_description),
      longDesc: this.getText(perm.full_description),
    };
  }

  private getText(obj: any) {
    return this.pam.utils.localeText(obj, this.pam.config.preferLanguage);
  }
}
