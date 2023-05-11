export declare enum JobType {
    TRACK = "track",
    LOGIN = "login",
    LOGOUT = "logout",
    ALLOW_CONSENT = "consent"
}
export declare enum ConsentType {
    CONTACT = "contacting_type",
    TRACKING = "tracking_type"
}
export declare enum TrackingConsentKey {
    TermsAndConditions = "_allow_terms_and_conditions",
    PrivacyOverview = "_allow_privacy_overview",
    NecessaryCookies = "_allow_necessary_cookies",
    PreferencesCookies = "_allow_preferences_cookies",
    AnalyticsCookies = "_allow_analytics_cookies",
    MarketingCookies = "_allow_marketing_cookies",
    SocialMediaCookies = "_allow_social_media_cookies"
}
export declare enum ContactingConsentKey {
    TermsAndConditions = "_allow_terms_and_conditions",
    PrivacyOverview = "_allow_privacy_overview",
    ContactEmail = "_allow_email",
    ContactSMS = "_allow_sms",
    ContactLine = "_allow_line",
    ContactFacebookMessenger = "_allow_facebook_messenger",
    ContactPushNotification = "_allow_push_notification"
}
