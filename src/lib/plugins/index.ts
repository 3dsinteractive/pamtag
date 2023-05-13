import { Plugin } from "../core/plugin";
import { FBPixel } from "./fb_pixel";
import { LoginState } from "./login_state";

export class PluginRegistration {
  plugins: Plugin[] = [new LoginState(), new FBPixel()];
}
