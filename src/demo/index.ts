import PamTracker from "../lib";
const pam = new PamTracker({
  webPushPublicKey: "",
  baseApi: "https://stgx.pams.ai",
  trackingConsentMessageId: "1qDQOyMeBv64LYnXi6dJOcZp2YQ",
  publicDBAlias: "my-ecommerce-public",
  loginDBAlias: "my-ecommerce-login",
  loginKey: "customer",
});

document.querySelector("body").innerHTML = `<h1>Hello World!</h1>`;

async function consent() {
  const tracking = "1qDQOyMeBv64LYnXi6dJOcZp2YQ";
  const contact = "1qDQgHFygpAhuX0gBxHkYAPiwBN";
  const consents = await pam.loadConsentDetails([tracking, contact]);

  consents[tracking].allowAll();
  consents[contact].allowAll();

  pam.submitConsent(consents[tracking], true);
  pam.submitConsent(consents[contact], true);
}

pam.track("start_demo", {}, true);
consent();
