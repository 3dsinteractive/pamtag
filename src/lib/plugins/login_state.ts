import PamTracker from "..";
import { Plugin } from "../core/plugin";

export class LoginState extends Plugin {
  override initPlugin(pam: PamTracker): void {
    pam.hook.onPreTracking("*", (p) => {
      const contactId = pam.contactState.getContactId();
      const database = pam.contactState.getDatabase();

      if (!database) {
        // When database is empty cancel the event tracking
        p.cancel = true;
        return p;
      }

      if (p.form_fields._contact_id === "<REMOVE>") {
        delete p.form_fields._contact_id;
      } else if (contactId) {
        p.form_fields._contact_id = contactId;
      }
      if (!p.form_fields._database) {
        p.form_fields._database = database;
      }

      return p;
    });

    pam.hook.onPostTracking("*", (payload, result) => {
      if (payload.event === "logout") {
        pam.contactState.logout();
      } else if (payload.event === "login") {
        if (pam.config.loginDBAlias === result._database) {
          const loginKey = pam.contactState.getLoginKey();
          const loginId = payload.form_fields[loginKey];
          pam.contactState.login(loginId);
        }
      }
      if (result.contact_id) {
        pam.contactState.setContactId(result.contact_id);
      }
    });

    pam.hook.onClean(async (config) => {
      pam.contactState.clean();
    });
  }
}
