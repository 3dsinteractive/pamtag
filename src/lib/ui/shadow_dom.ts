import PamTracker from "..";
import * as Eta from "eta";

export default class ShadowDom {
  host?: HTMLElement;
  hostId: string;
  root?: ShadowRoot;
  pam: PamTracker;
  private static count = 0;

  constructor(pam: PamTracker) {
    this.pam = pam;
    this.hostId = `pam-${ShadowDom.count++}`;
  }

  destroy() {
    if (typeof this.host !== "undefined") {
      this.host.remove();
      this.root = undefined;
      this.host = undefined;
    }
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
      
      // script from api
      const script = document.createElement('script');
      // use local file
      // script.src = 'script.js';
      // script.src ='https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.1/jquery.min.js';
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = variable?.CUSTOM_JS;
      // make code in script to be treated as JavaScript module
      // script.type = 'module';
      script.onload = () => {
        console.log('Script loaded successfuly');
      };
      script.onerror = () => {
        console.log('Error occurred while loading script');
      };
      this.root.appendChild(script);

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
