import PamTracker from ".";

export {};

declare global {
  interface Window {
    getPam: () => Promise<PamTracker>;
    pam: PamTracker;
    fbq?: facebook.Pixel.Event;
    gtag?: Gtag.Gtag;
    dataLayer: any[];
  }
}
