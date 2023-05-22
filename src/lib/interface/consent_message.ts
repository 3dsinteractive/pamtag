import {
  ConsentType,
  TrackingConsentKey,
  ContactingConsentKey,
} from "../enums/enums";

export class ConsentMessage {
  data: IConsentMessage;
  type: ConsentType;

  private nameTable: Record<TrackingConsentKey | ContactingConsentKey, string> =
    {
      _allow_terms_and_conditions: "Terms & Conditions",
      _allow_privacy_overview: "Privacy Overview",
      [TrackingConsentKey.NecessaryCookies]: "Necessary Cookies",
      [TrackingConsentKey.PreferencesCookies]: "Preferences Cookies",
      [TrackingConsentKey.AnalyticsCookies]: "Analytics Cookies",
      [TrackingConsentKey.MarketingCookies]: "Marketing Cookies",
      [TrackingConsentKey.SocialMediaCookies]: "SocialMedia Cookies",
      [ContactingConsentKey.ContactEmail]: "Email",
      [ContactingConsentKey.ContactSMS]: "EME",
      [ContactingConsentKey.ContactLine]: "Line",
      [ContactingConsentKey.ContactFacebookMessenger]: "Facebook Messenger",
      [ContactingConsentKey.ContactPushNotification]: "Push Notification",
    };

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

  private wrapToConsentPermission(
    key: TrackingConsentKey | ContactingConsentKey,
    allow: boolean,
    permission: IConsentDetailByType
  ): IConsentPermission {
    return {
      key: key,
      allow: allow,
      name: this.nameTable[key],
      briefDescription: permission.brief_description,
      fullDescription: permission.full_description,
      isFullDescriptionEnabled: permission.is_full_description_enabled,
    };
  }

  private extractTrackingConsent() {
    const data = this.data;
    this.permission = [];

    if (data.setting.terms_and_conditions.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.TermsAndConditions,
        true,
        data.setting.terms_and_conditions
      );
      this.permission.push(c);
    }

    if (data.setting.privacy_overview.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.PrivacyOverview,
        true,
        data.setting.privacy_overview
      );
      this.permission.push(c);
    }

    if (data.setting.necessary_cookies.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.NecessaryCookies,
        true,
        data.setting.necessary_cookies
      );
      this.permission.push(c);
    }

    if (data.setting.preferences_cookies.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.PreferencesCookies,
        true,
        data.setting.preferences_cookies
      );
      this.permission.push(c);
    }

    if (data.setting.analytics_cookies.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.AnalyticsCookies,
        true,
        data.setting.analytics_cookies
      );
      this.permission.push(c);
    }

    if (data.setting.marketing_cookies.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.MarketingCookies,
        true,
        data.setting.marketing_cookies
      );
      this.permission.push(c);
    }

    if (data.setting.social_media_cookies.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        TrackingConsentKey.SocialMediaCookies,
        true,
        data.setting.social_media_cookies
      );
      this.permission.push(c);
    }
  }

  private extractContactingConsent() {
    const data = this.data;
    this.permission = [];

    if (data.setting.terms_and_conditions.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.TermsAndConditions,
        true,
        data.setting.terms_and_conditions
      );
      this.permission.push(c);
    }

    if (data.setting.privacy_overview.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.PrivacyOverview,
        true,
        data.setting.privacy_overview
      );
      this.permission.push(c);
    }

    if (data.setting.email.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.ContactEmail,
        true,
        data.setting.email
      );
      this.permission.push(c);
    }

    if (data.setting.sms.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.ContactSMS,
        true,
        data.setting.sms
      );
      this.permission.push(c);
    }

    if (data.setting.line.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.ContactLine,
        true,
        data.setting.line
      );
      this.permission.push(c);
    }

    if (data.setting.facebook_messenger.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.ContactFacebookMessenger,
        true,
        data.setting.facebook_messenger
      );
      this.permission.push(c);
    }

    if (data.setting.push_notification.is_enabled === true) {
      const c = this.wrapToConsentPermission(
        ContactingConsentKey.ContactPushNotification,
        true,
        data.setting.push_notification
      );
      this.permission.push(c);
    }
  }
}

export interface IConsentPermission {
  key: TrackingConsentKey | ContactingConsentKey;
  allow: boolean;
  name: string;
  briefDescription: IDataByLanguage;
  fullDescription: IDataByLanguage;
  isFullDescriptionEnabled: boolean;
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
