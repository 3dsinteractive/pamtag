import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class AutoPageView extends Plugin {
  previousUrl = "";
  pam: PamTracker;

  autoTrackPageview() {
    var observer = new MutationObserver((mutations) => {
      if (location.href !== this.previousUrl) {
        this.previousUrl = location.href;
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
          pam.track("page_view");
          this.autoTrackPageview();
        }
      }
      return;
    });
  }
}
