export class Utils {
  setCookie(name: string, value: string, hours: number) {
    var expires = "";
    if (hours) {
      var date = new Date();
      date.setTime(date.getTime() + hours * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  getCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  getPageURL() {
    return window.document.location && window.document.location.href;
  }

  deleteCookie(name: string) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }

  localeText(obj: any, lang: string) {
    if (obj[lang]) {
      return obj[lang];
    }
    return obj["en"];
  }

  applyOpacityToColor(colorCode: string, opacity: number) {
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

  templateReplaceValue(source: string, variables: Record<string, any>) {
    Object.keys(variables).forEach((k) => {
      var value = variables[k];
      var regex = new RegExp(`"{${k}}"`, "g");
      source = source.replace(regex, value);
    });
    return source;
  }

  getScrollPercent = (): number => {
    const h = document.documentElement;
    const b = document.body;
    const st = "scrollTop";
    const sh = "scrollHeight";
    return h && b
      ? ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100
      : 0;
  };
}
