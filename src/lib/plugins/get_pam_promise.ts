import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class GetPamPromise extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onStartup((config): Promise<void> => {
      const w = window as any;
      w.getPam = function () {
        return new Promise(function (resolve) {
          if (w.pam) {
            resolve(w.pam);
            return;
          }
          var intervalId = setInterval(function () {
            if (w.pam !== null && typeof w.pam !== "undefined") {
              clearInterval(intervalId);
              resolve(w.pam);
            }
          }, 200);
        });
      };
      return;
    });
  }
}
