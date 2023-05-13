import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class PrepareGTM extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onStartup((config): Promise<void> => {
      const w = window as any;
      w.dataLayer = w.dataLayer || [];
      if (!w.gtag) {
        w.gtag = function () {
          w.dataLayer.push(arguments);
        };
      }
      return;
    });
  }
}
