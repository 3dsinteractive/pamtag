export default interface IConfig {
  webPushPublicKey: string;
  baseApi: string;
  trackingConsentMessageId: string;
  contactingConsentMessageIds?: string[];
  publicDBAlias: string;
  loginDBAlias: string;
  loginKey: string;
}
