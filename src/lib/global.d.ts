import PamTracker from ".";

export {};

declare global {
  interface Window {
    getPam: () => Promise<PamTracker>;
    pam: PamTracker;
    fbq: Function;
    gtag: Function;
    dataLayer: any[];
  }
}
