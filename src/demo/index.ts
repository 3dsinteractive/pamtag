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
  //pam.openConsentPopup(contact);
  for (var i = 0; i <= 3; i++) {
    pam.track(`event_${i}`, { round: i }, true);
  }
  for (var i = 0; i <= 3; i++) {
    pam.track(`event_${i}`, { round: i });
  }
  pam.eventBucket(() => {
    pam.track(`a`, { round: i });
    pam.track(`b`, { round: i });
    pam.track(`c`, { round: i });
  });
}

//console.log(pam.hashGenerator.sha256("12345"));
