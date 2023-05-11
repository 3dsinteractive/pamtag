import PamTracker from "../index";

it("Runs without crashing", () => {
  new PamTracker({
    webPushPublicKey: "",
    baseApi: "",
    trackingConsentMessageId: "",
    contactingConsentMessageIds: [],
    publicDBAlias: "",
    loginDBAlias: "",
    loginKey: "",
  });
});
