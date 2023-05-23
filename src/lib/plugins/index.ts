import { Plugin } from "../core/plugin";
import { FBPixel } from "./fb_pixel";
import { LoginState } from "./login_state";
import { UTMPlugin } from "./utm_plugin";
import { AutoPageView } from "./auto_pageview";
import { GoogleTagManager } from "./google_tag_manager";
import { GetPamPromise } from "./get_pam_promise";
import { WebAttenTionPlugin } from "./web_attention";
import { CookieConsentPlugin } from "./cookie_consent";
import IConfig from "../interface/iconfig";

export class PluginRegistration {
  static getPlugins(config: IConfig): Plugin[] {
    let plugins: Plugin[] = [
      new GetPamPromise(),
      new GoogleTagManager(),
      new AutoPageView(),
      new LoginState(),
      new UTMPlugin(),
      new FBPixel(),
      new WebAttenTionPlugin(),
      new CookieConsentPlugin(),
    ];
    return plugins;
  }
}
