import { PamAPI } from "./api";
import { Utils } from "./utils";
export class ContactStateManager {
  private cookieExpireHours = 24 * 90; // Expire 90days

  private publicContact: string;
  private loginContact: string;
  private publicDB: string;
  private loginDB: string;
  private loginKey: string;
  private loginId: string;

  private loginStatus = false;

  utls = new Utils();

  constructor(publicDB: string, loginDB: string, loginKey: string) {
    this.publicDB = publicDB;
    this.loginDB = loginDB;
    this.loginKey = loginKey;
  }

  clean() {
    this.loginStatus = false;
    this.loginId = "";
    this.publicContact = "";
    this.loginContact = "";

    this.utls.deleteCookie("loginStatus");
    this.utls.deleteCookie("loginId");
    this.utls.deleteCookie("publicContact");
    this.utls.deleteCookie("loginContact");
    this.utls.deleteCookie("contact_id");
  }

  resumeSession() {
    this.loginStatus = this.utls.getCookie("loginStatus") == "true";
    this.loginId = this.utls.getCookie("loginId") ?? "";
    this.publicContact = this.utls.getCookie("publicContact") ?? "";
    this.loginContact = this.utls.getCookie("loginContact") ?? "";
  }

  setContactId(contactId: string) {
    if (this.loginStatus) {
      this.loginContact = contactId;
      this.utls.setCookie("loginContact", contactId, this.cookieExpireHours);
    } else {
      this.publicContact = contactId;
      this.utls.setCookie("publicContact", contactId, this.cookieExpireHours);
    }
  }

  login(loginId: string) {
    this.loginId = loginId;
    this.loginStatus = true;

    this.utls.setCookie("loginId", loginId, this.cookieExpireHours);
    this.utls.setCookie("loginStatus", "true", this.cookieExpireHours);
  }

  logout() {
    this.loginId = "";
    this.loginStatus = false;

    this.utls.deleteCookie("loginId");
    this.utls.deleteCookie("loginStatus");
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
