import {
  ConsentType,
  TrackingConsentKey,
  ContactingConsentKey,
} from "../enums/enums";

export class ConsentMessage {
  data: IConsentMessage;
  type: ConsentType;

  permission: IConsentPermission[] = [];

  constructor(data: IConsentMessage) {
    this.data = data;
    if (data.consent_message_type === "tracking_type") {
      this.type = ConsentType.TRACKING;
      this.extractTrackingConsent();
    } else if (data.consent_message_type === "contacting_type") {
      this.type = ConsentType.CONTACT;
      this.extractContactingConsent();
    }
  }

  allow(
    permission: TrackingConsentKey | ContactingConsentKey,
    isAllow: boolean
  ) {
    if (
      (permission === TrackingConsentKey.TermsAndConditions ||
        permission === ContactingConsentKey.TermsAndConditions) &&
      !isAllow
    ) {
      throw Error("TermsAndConditions Cannot be disallow");
    }

    if (
      (permission === TrackingConsentKey.PrivacyOverview ||
        permission === ContactingConsentKey.PrivacyOverview) &&
      !isAllow
    ) {
      throw Error("PrivacyOverview Cannot be disallow");
    }

    for (const i in this.permission) {
      if (this.permission[i].key === permission) {
        this.permission[i].allow = isAllow;
      }
    }
  }

  allowAll() {
    for (const i in this.permission) {
      this.permission[i].allow = true;
    }
  }

  disallowAll() {
    for (const i in this.permission) {
      if (
        this.permission[i].key === TrackingConsentKey.TermsAndConditions ||
        this.permission[i].key === ContactingConsentKey.TermsAndConditions ||
        this.permission[i].key === TrackingConsentKey.PrivacyOverview ||
        this.permission[i].key === ContactingConsentKey.PrivacyOverview
      ) {
        continue;
      }
      this.permission[i].allow = false;
    }
  }

  buildFormField(): Record<string, any> {
    const formField: Record<string, any> = {
      _consent_message_id: this.data.consent_message_id,
      _version: this.data.setting.version,
    };

    this.permission.forEach((e) => {
      formField[e.key] = e.allow;
    });

    return formField;
  }

  private extractTrackingConsent() {
    const data = this.data;
    this.permission = [];

    if (data.setting.terms_and_conditions.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.TermsAndConditions,
        allow: true,
      };
      this.permission.push(c);
    }

    if (data.setting.privacy_overview.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.PrivacyOverview,
        allow: true,
      };
      this.permission.push(c);
    }

    if (data.setting.necessary_cookies.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.NecessaryCookies,
        allow: true,
      };
      this.permission.push(c);
    }

    if (data.setting.preferences_cookies.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.PreferencesCookies,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.analytics_cookies.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.AnalyticsCookies,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.marketing_cookies.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.MarketingCookies,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.social_media_cookies.is_enabled === true) {
      const c = {
        key: TrackingConsentKey.SocialMediaCookies,
        allow: false,
      };
      this.permission.push(c);
    }
  }

  private extractContactingConsent() {
    const data = this.data;
    this.permission = [];

    if (data.setting.terms_and_conditions.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.TermsAndConditions,
        allow: true,
      };
      this.permission.push(c);
    }

    if (data.setting.privacy_overview.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.PrivacyOverview,
        allow: true,
      };
      this.permission.push(c);
    }

    if (data.setting.email.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.ContactEmail,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.sms.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.ContactSMS,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.line.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.ContactLine,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.facebook_messenger.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.ContactFacebookMessenger,
        allow: false,
      };
      this.permission.push(c);
    }

    if (data.setting.push_notification.is_enabled === true) {
      const c = {
        key: ContactingConsentKey.ContactPushNotification,
        allow: false,
      };
      this.permission.push(c);
    }
  }
}

export interface IConsentPermission {
  key: TrackingConsentKey | ContactingConsentKey;
  allow: boolean;
}

export interface IConsentMessage {
  consent_message_id: string;
  name: string;
  consent_message_type: string;
  description: string;
  setting: {
    available_languages: string[];
    default_language: string;
    version?: number;
    revision?: number;

    display_text: IDataByLanguage;
    accept_button_text: IDataByLanguage;
    consent_detail_title: IDataByLanguage;
    more_info: IMoreInfo;

    terms_and_conditions: IConsentDetailByType;
    privacy_overview: IConsentDetailByType;
    necessary_cookies: IConsentDetailByType;
    preferences_cookies: IConsentDetailByType;
    analytics_cookies: IConsentDetailByType;
    marketing_cookies: IConsentDetailByType;
    social_media_cookies: IConsentDetailByType;

    email: IConsentDetailByType;
    sms: IConsentDetailByType;
    line: IConsentDetailByType;
    facebook_messenger: IConsentDetailByType;
    push_notification: IConsentDetailByType;

    [key: string]: any;
  };
  style_configuration: {
    bar_background_color: string;
    bar_text_color: string;
    bar_background_opacity_percentage: any;
    button_background_color: string;
    button_text_color: string;
    consent_detail: {
      popup_main_icon: string;
      primary_color: string;
      secondary_color: string;
      button_text_color: string;
      text_color: string;
    };
  };
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface IDataByLanguage {
  // th: string
  // en: string

  [key: string]: string;
}

export interface IMoreInfo {
  display_text: IDataByLanguage;
  is_custom_url_enabled: boolean;
  custom_url: IDataByLanguage;
}

export interface IConsentDetailByType {
  is_enabled: boolean;
  brief_description: IDataByLanguage;
  full_description: IDataByLanguage;
  is_full_description_enabled: boolean;

  tracking_collection?: any;
  [key: string]: any;
}
