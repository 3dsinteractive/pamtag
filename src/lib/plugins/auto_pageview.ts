import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class AutoPageView extends Plugin {
  previousUrl = "";
  pam: PamTracker;

  autoTrackPageview() {
    //first pageview
    this.previousUrl = this.pam.utils.getPageURL();
    this.pam.track("page_view");

    var observer = new MutationObserver((mutations) => {
      const url = this.pam.utils.getPageURL();
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
