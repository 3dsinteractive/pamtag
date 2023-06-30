import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class LoginState extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onPreTracking("*", (p) => {
      const contactId = pam.contactState.getContactId();
      const database = pam.contactState.getDatabase();
      if (contactId) {
        p.form_fields._contact_id = contactId;
      }
      p.form_fields._database = database;
      return p;
    });

    pam.hook.onPostTracking("*", (payload, result) => {
      if (payload.event === "logout") {
        pam.contactState.logout();
      } else if (payload.event === "login") {
        const loginKey = pam.contactState.getLoginKey();
        const loginId = payload.form_fields[loginKey];
        pam.contactState.login(loginId);
      }
      pam.contactState.setContactId(result.contact_id);
    });

    pam.hook.onClean(async (config) => {
      pam.contactState.clean();
    });
  }
}
