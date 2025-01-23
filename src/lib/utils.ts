import IConfig from "./interface/iconfig";
import { IStorageProvider } from "./storage_provider";

export class Utils {
  private static storage: IStorageProvider;
  private static config: IConfig;

  static setConfig(config: IConfig) {
    Utils.config = config;
  }

  static setStorageProvider(storage: IStorageProvider) {
    Utils.storage = storage;
  }

  static setCookie(name: string, value: string, hours: number) {
    Utils.storage.setCookie(name, value, hours);
  }

  static getCookie(name: string) {
    return Utils.storage.getCookie(name);
  }

  static deleteCookie(name: string) {
    Utils.storage.deleteCookie(name);
  }

  static setLocalStorage(key: string, value: string) {
    Utils.storage.setLocalStorage(key, value);
  }

  static getLocalStorage(key: string) {
    return Utils.storage.getLocalStorage(key);
  }

  static deleteLocalStorage(key: string) {
    Utils.storage.deleteLocalStorage(key);
  }

  static getPageURL() {
    if (Utils.config.mobileAppMode) {
      return undefined;
    }
    return window.document.location && window.document.location.href;
  }

  static localeText(obj: any, lang: string) {
    if (obj[lang]) {
      return obj[lang];
    }
    return obj["en"];
  }

  static applyOpacityToColor(colorCode: string, opacity: number) {
    // Remove the '#' symbol from the color code
    const hex = colorCode.replace("#", "");

    // Convert the opacity (a decimal value between 0 and 1) to a 2-digit hexadecimal string
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0");

    // Append the alpha value to the color code
    const adjustedHex = "#" + hex + alpha;

    return adjustedHex;
  }

  static templateReplaceValue(source: string, variables: Record<string, any>) {
    Object.keys(variables).forEach((k) => {
      var value = variables[k];
      var regex = new RegExp(`"{${k}}"`, "g");
      source = source.replace(regex, value);
    });
    return source;
  }

  static getScrollPercent = (): number => {
    const h = document.documentElement;
    const b = document.body;
    const st = "scrollTop";
    const sh = "scrollHeight";
    return h && b
      ? ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100
      : 0;
  };

  static getBrowserLanguage() {
    if (Utils.config.mobileAppMode) {
      return undefined;
    }
    return window.navigator.language;
  }

  static getPageReferer() {
    if (Utils.config.mobileAppMode) {
      return undefined;
    }
    return window.document.referrer;
  }

  static getWindowTitle() {
    if (Utils.config.mobileAppMode) {
      return undefined;
    }
    return window.document.title;
  }

  static getUserAgent() {
    if (Utils.config.mobileAppMode) {
      return undefined;
    }
    return window.navigator.userAgent;
  }
}
