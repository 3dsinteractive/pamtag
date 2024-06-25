export interface ICustomerConsentStatus {
  consent_id?: string;
  consent_message_id?: string;
  contact_id?: string;
  consent_message_type?: string;
  version?: number;
  tracking_permission?: {
    terms_and_conditions?: boolean;
    privacy_overview?: boolean;
    necessary_cookies?: boolean;
    preferences_cookies?: boolean;
    analytics_cookies?: boolean;
    marketing_cookies?: boolean;
    social_media_cookies?: boolean;
  };
  contacting_permission?: {
    terms_and_conditions?: boolean;
    privacy_overview?: boolean;
    email?: boolean;
    sms?: boolean;
    line?: boolean;
    facebook_messenger?: boolean;
    web_push?: boolean;
  };
  last_consent_version?: number;
  latest_version?: string;
  last_consent_at?: string;
  need_consent_review?: boolean;
  created_at?: string;
  updated_at?: string;
}
