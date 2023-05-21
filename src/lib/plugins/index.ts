import { Plugin } from "../core/plugin";
import { FBPixel } from "./fb_pixel";
import { LoginState } from "./login_state";
import { UTMPlugin } from "./utm_plugin";
import { AutoPageView } from "./auto_pageview";
import { PrepareGTM } from "./prepare_gtm";
import { GetPamPromise } from "./get_pam_promise";
import { WebAttenTionPlugin } from "./web_attention";
import { CookieConsentPlugin } from "./cookie_consent";
export class PluginRegistration {
  plugins: Plugin[] = [
    new GetPamPromise(),
    new PrepareGTM(),
    new AutoPageView(),
    new LoginState(),
    new UTMPlugin(),
    new FBPixel(),
    new WebAttenTionPlugin(),
    new CookieConsentPlugin(),
  ];
}
