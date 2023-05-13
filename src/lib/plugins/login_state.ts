import PamTracker from "..";
import { Plugin } from "../core/plugin";
import { ContactStateManager } from "../contact_state_manager";

export class LoginState extends Plugin {
  private contactState: ContactStateManager;

  override initPlugin(pam: PamTracker): void {
    this.contactState = new ContactStateManager(
      pam.config.publicDBAlias,
      pam.config.loginDBAlias,
      pam.config.loginKey
    );
    this.contactState.resumeSession();

    pam.hook.onPreTracking("*", (p) => {
      const contactId = this.contactState.getContactId();
      const database = this.contactState.getDatabase();
      if (contactId) {
        p.form_fields._contact_id = contactId;
      }
      p.form_fields._database = database;
      return p;
    });

    pam.hook.onPostTracking("login", (payload, result) => {
      const loginKey = this.contactState.getLoginKey();
      const loginId = payload.form_fields[loginKey];
      this.contactState.login(loginId);
      this.contactState.setContactId(result.contact_id);
    });

    pam.hook.onPostTracking("logout", (payload, result) => {
      this.contactState.logout();
      this.contactState.setContactId(result.contact_id);
    });
  }
}
