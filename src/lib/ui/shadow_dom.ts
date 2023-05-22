import { v4 as uuidv4 } from "uuid";
import PamTracker from "..";
import * as Eta from "eta";

export default class ShadowDom {
  host?: HTMLElement;
  hostId: string;
  root?: ShadowRoot;
  pam: PamTracker;

  constructor(pam: PamTracker) {
    this.pam = pam;
    this.hostId = `pam-${uuidv4()}`;
  }

  destroy() {
    this.host.remove();
    this.root = undefined;
    this.host = undefined;
  }

  removeAllChild() {
    if (this.root) {
      this.root.childNodes.forEach((node) => {
        node.remove();
      });
    }
  }

  addHtmlTemplate(htmlContent: string, variable: Record<string, any>) {
    try {
      Eta.configure({ autoEscape: false });
      const html = Eta.render(htmlContent, variable);

      const div = document.createElement("div");
      div.innerHTML = html;
      this.root.appendChild(div);
      return div;
    } catch (e: any) {
      console.log(e);
    }
    return undefined;
  }

  attachShadowDom(open: boolean) {
    this.host = document.createElement("div");
    this.host.id = this.hostId;
    document.body.appendChild(this.host);

    const option: ShadowRootInit = {
      mode: open ? "open" : "closed",
    };

    this.root = this.host.attachShadow(option);
  }
}
