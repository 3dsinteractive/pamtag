import PamTracker from '../lib';
const pam = new PamTracker({
  webPushPublicKey: '',
  baseApi: 'https://stgx.pams.ai',
  trackingConsentMessageId: '1qDQOyMeBv64LYnXi6dJOcZp2YQ',
  publicDBAlias: 'ecom-public',
  loginDBAlias: 'ecom-login',
  loginKey: 'customer',
  autoTrackPageview: true,
  displayCookieConsentBarOnStartup: true,
  preferLanguage: 'th',
});

document.querySelector('head').innerHTML = `<link rel="stylesheet"
href="https://fonts.googleapis.com/css?family=Noto+Sans+Thai">
<style>
body{
  font-family: 'Noto Sans Thai';
}
</style>`;

document.querySelector('body').innerHTML = `
<div id="masthead"></div>
<div class="site-header-space"></div>
<div id="box"></div>
<h1>Hello World!</h1><button id="openConsent">Consent</button><br><button id="trackEvent">TrackEvent</button><button id="trackEvent2">TrackEvent 2</button>`;

const tracking = '1qDQOyMeBv64LYnXi6dJOcZp2YQ';
const contact = '1qDQgHFygpAhuX0gBxHkYAPiwBN';

var btn = document.getElementById('openConsent');
btn.addEventListener('click', async (e) => {
  pam.openConsentPopup(contact, true);
  // test();
});

var trackEvent = document.getElementById('trackEvent');
trackEvent.addEventListener('click', async (e) => {
  pam.userLogin('0000000000');
  //.track(`test_event`, { test: 1, customer: "55555999" });
});

var trackEvent2 = document.getElementById('trackEvent2');
trackEvent2.addEventListener('click', async (e) => {
  pam.track(`test_event_2`, { test: 2 });
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
