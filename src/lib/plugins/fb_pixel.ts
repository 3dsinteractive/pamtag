import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class FBPixel extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onPreTracking("*", (p) => {
      const fbp = pam.utils.getCookie("_fbp");
      const fbc = pam.utils.getCookie("_fbc");
      if (fbp) {
        p.form_fields._fbp = fbp;
      }
      if (fbc) {
        p.form_fields._fbc = fbc;
      }
      return p;
    });
  }
}
