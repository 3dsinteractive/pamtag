import PamTracker from "../lib";
const pam = new PamTracker({
  webPushPublicKey: "",
  baseApi: "https://stgx.pams.ai",
  trackingConsentMessageId: "1qDQOyMeBv64LYnXi6dJOcZp2YQ",
  publicDBAlias: "my-ecommerce-public",
  loginDBAlias: "my-ecommerce-login",
  loginKey: "customer",
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

async function consent() {
  const consents = await pam.loadConsentDetails([tracking, contact]);

  consents[tracking].allowAll();
  consents[contact].allowAll();

  pam.submitConsent(consents[tracking], true);
  pam.submitConsent(consents[contact], true);
}

var btn = document.getElementById("openConsent");
btn.addEventListener("click", async (e) => {
  const result = await pam.openConsentPopup(contact);
});

//pam.track("start_demo", {}, true);
//consent();

(window as any).getPam().then(async (p) => {
  p.track("event1", {});
  p.track("event2", {});
  p.track("event3", {}, true, true);
  p.track("event4", {});
  // const tracking = "1qDQOyMeBv64LYnXi6dJOcZp2YQ";
  // const contact = "1qDQgHFygpAhuX0gBxHkYAPiwBN";
  // const consents = await pam.loadConsentDetails([tracking, contact]);
  // consents[tracking].allowAll();
  // consents[contact].allowAll();
  // pam.submitConsent(consents[tracking], true, true);
  // pam.submitConsent(consents[contact], true);

  // p.track("event3-cookie-less", {}, true);
  // p.track("event4", {}, true);
  // p.track("event5", {}, true);
});
