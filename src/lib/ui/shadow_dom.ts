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
      
      // default script
      const defaultScript = document.createElement('script');
      defaultScript.type = "text/javascript";
      defaultScript.async = true;
      defaultScript.innerHTML = this.defaultScript();
      defaultScript.onload = () => {
        console.log('Default script loaded successfuly');
      };
      defaultScript.onerror = () => {
        console.log('Error occurred while loading default script');
      };
      this.root.appendChild(defaultScript);

      
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

  defaultScript() {
    let script = `

    function submitFormData() {
      const pamShadowRoot = document.getElementById("pam-0").shadowRoot;
      if (pamShadowRoot) {
        // Access the form within the shadow root
        const form = pamShadowRoot.querySelector("form");
        
        if (form) {
          // Add an event listener to handle form submission
          // form.addEventListener('submit', function(event) {
          //   event.preventDefault(); // Prevent the form from submitting the traditional way
            
          //   const formDataJson = getFormDataAsJson(form);
          //   console.log('formDataJson', formDataJson);
          //   if (formDataJson) {
          //     window.pam.track("web_attention", formDataJson);
          //     pamShadowRoot.querySelector(".x-icon").click();
          //   }
          // });

          if (typeof validateAttentionForm === "function") {
            let isValidatePass = validateAttentionForm(form);
            if (!isValidatePass) {
              return;
            }
          }

          const formDataObj = getFormDataAsJson(form);
          console.log('formDataObj', formDataObj);

          const isObjectEmpty = (objectName) => {
            return Object.keys(objectName).length === 0
          }
          if (!isObjectEmpty(formDataObj)) {
            window.pam.track("web_attention", formDataObj);
            pamShadowRoot.querySelector(".x-icon").click();
          }
        }
      }
    }

    function getFormDataAsJson(formElement) {
      const formData = new FormData(formElement);
      const formEntries = {};

      for (let [key, value] of formData.entries()) {
        if (formEntries[key]) {
          if (Array.isArray(formEntries[key])) {
              formEntries[key].push(value);
          } else {
              formEntries[key] = [formEntries[key], value];
          }
        } else {
            formEntries[key] = value;
        }
      }

      return formEntries;
    }
    
    ` 

    return script;
  }
}
