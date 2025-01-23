import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { Utils } from "../utils";

export class AutoPageView extends Plugin {
  previousUrl = "";
  pam: PamTracker;

  autoTrackPageview() {
    //first pageview
    this.previousUrl = Utils.getPageURL();
    this.pam.track("page_view");

    var observer = new MutationObserver((mutations) => {
      const url = Utils.getPageURL();
      if (url !== this.previousUrl) {
        this.previousUrl = url;
        this.pam.track("page_view");
      }
    });
    var config = { subtree: true, childList: true };
    observer.observe(document, config);
  }

  override initPlugin(pam: PamTracker): void {
    this.pam = pam;

    pam.hook.onStartup((config): Promise<void> => {
      if (config.autoTrackPageview === true) {
        if (config.autoTrackPageview) {
          this.autoTrackPageview();
        }
      }
      return;
    });
  }
}
