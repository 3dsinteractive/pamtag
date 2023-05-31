import PamTracker from "../lib";
const pam = new PamTracker({
  webPushPublicKey: "",
  baseApi: "https://stgx.pams.ai",
  trackingConsentMessageId: "1qDQOyMeBv64LYnXi6dJOcZp2YQ",
  publicDBAlias: "ecom-public",
  loginDBAlias: "ecom-public",
  loginKey: "email",
  autoTrackPageview: true,
  displayCookieConsentBarOnStartup: true,
  preferLanguage: "th",
});

document.querySelector("head").innerHTML = `<link rel="stylesheet"
href="https://fonts.googleapis.com/css?family=Noto+Sans+Thai">
<style>
body{
  font-family: 'Noto Sans Thai';
}
</style>`;

document.querySelector(
  "body"
).innerHTML = `<h1>Hello World!</h1><button id="openConsent">Consent</button>`;

const tracking = "1qDQOyMeBv64LYnXi6dJOcZp2YQ";
const contact = "1qDQgHFygpAhuX0gBxHkYAPiwBN";

var btn = document.getElementById("openConsent");
btn.addEventListener("click", async (e) => {
  test();
});

function test() {
  window.getPam().then(function (pam) {
    var payload = {
      firstname: "heart",
      lastname: "heart",
      email: "fakemail@gmail2.com",
      _allow_consent: true,
      _version: "latest",
      _allow_terms_and_conditions: true,
      _allow_privacy_overview: true,
      _allow_necessary_cookies: true,
      _allow_preferences_cookies: true,
      _allow_analytics_cookies: true,
      _allow_marketing_cookies: true,
      _allow_social_media_cookies: true,
    };

    pam.eventBucket(function () {
      pam.track("confirm_insured_info", payload);
      pam.allowAllContactConsent(contact, false, false, {
        email: "fakemail@gmail2.com",
      });
    });
  });
}

window.getPam().then((pam) => {
  pam.track("test1", {});
  pam.track("test2", {});
});
