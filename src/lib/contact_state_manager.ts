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

    Utils.deleteCookie("loginStatus");
    Utils.deleteCookie("loginId");
    Utils.deleteCookie("publicContact");
    Utils.deleteCookie("loginContact");
    Utils.deleteCookie("contact_id");
  }

  async resumeSession() {
    this.loginStatus =
      (await Promise.resolve(Utils.getCookie("loginStatus"))) == "true";
    this.loginId = (await Promise.resolve(Utils.getCookie("loginId"))) ?? "";
    this.publicContact =
      (await Promise.resolve(Utils.getCookie("publicContact"))) ?? "";
    this.loginContact =
      (await Promise.resolve(Utils.getCookie("loginContact"))) ?? "";
  }

  setContactId(contactId: string) {
    if (this.loginStatus) {
      this.loginContact = contactId;
      Utils.setCookie("loginContact", contactId, this.cookieExpireHours);
    } else {
      this.publicContact = contactId;
      Utils.setCookie("publicContact", contactId, this.cookieExpireHours);
    }
  }

  login(loginId: string) {
    this.loginId = loginId;
    this.loginStatus = true;

    Utils.setCookie("loginId", loginId, this.cookieExpireHours);
    Utils.setCookie("loginStatus", "true", this.cookieExpireHours);
  }

  logout() {
    this.loginId = "";
    this.loginStatus = false;

    Utils.deleteCookie("loginId");
    Utils.deleteCookie("loginStatus");
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
