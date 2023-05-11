export class ContactStateManager {
  private publicContact: string;
  private loginContact: string;
  private publicDB: string;
  private loginDB: string;
  private loginKey: string;
  private loginId: string;

  private loginStatus = false;

  constructor(publicDB: string, loginDB: string, loginKey: string) {
    this.publicDB = publicDB;
    this.loginDB = loginDB;
    this.loginKey = loginKey;
  }

  resumeSession() {
    this.loginStatus = window.localStorage.loginStatus == "true";
    this.loginId = window.localStorage.loginId ?? "";
    this.publicContact = window.localStorage.publicContact ?? "";
    this.loginContact = window.localStorage.loginContact ?? "";
  }

  setContactId(contactId: string) {
    if (this.loginStatus) {
      this.loginContact = contactId;
      window.localStorage.loginContact = contactId;
    } else {
      this.publicContact = contactId;
      window.localStorage.publicContact = contactId;
    }
  }

  login(loginId: string) {
    this.loginId = loginId;
    this.loginStatus = true;
    window.localStorage.loginId = loginId;
    window.localStorage.loginStatus = "true";
  }

  logout() {
    this.loginId = "";
    this.loginStatus = false;
    window.localStorage.loginId = "";
    window.localStorage.loginStatus = "false";
  }

  getLoginKey() {
    return this.loginKey;
  }

  getLoginId() {
    return this.loginId;
  }

  getContactId() {
    if (this.loginStatus) {
      return this.loginContact;
    }
    return this.publicContact;
  }

  getDatabase() {
    if (this.loginStatus) {
      return this.loginDB;
    }
    return this.publicDB;
  }
}
