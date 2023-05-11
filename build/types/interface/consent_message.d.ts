import { ConsentType, TrackingConsentKey, ContactingConsentKey } from "../enums/enums";
export declare class ConsentMessage {
    data: IConsentMessage;
    type: ConsentType;
    permission: IConsentPermission[];
    constructor(data: IConsentMessage);
    allow(permission: TrackingConsentKey | ContactingConsentKey, isAllow: boolean): void;
    allowAll(): void;
    disallowAll(): void;
    buildFormField(): Record<string, any>;
    private extractTrackingConsent;
    private extractContactingConsent;
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
