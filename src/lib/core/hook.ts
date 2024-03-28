import { ITrackerResponse } from "../interface/itracker_response";
import IConfig from "../interface/iconfig";

interface TrackingListener {
  event: any;
  callback: (
    payload: Record<string, any>,
    result?: ITrackerResponse
  ) => Promise<any>;
}

interface SystemListener {
  callback: (config: IConfig) => Promise<void>;
}

export class Hook {
  constructor() {}

  preEventListener: TrackingListener[] = [];
  postEventListener: TrackingListener[] = [];
  startupListener: SystemListener[] = [];
  cleanListener: SystemListener[] = [];

  private isMatchEvent(srcEvent: string, listen: any) {
    if (listen === "*" && srcEvent != "__error") {
      return true;
    } else if (listen.constructor.name === "RegExp") {
      return (listen as RegExp).test(srcEvent);
    } else if (srcEvent === listen) {
      return true;
    }
    return false;
  }

  async dispatchPostTracking(
    event: string,
    payload: Record<string, any>,
    response: ITrackerResponse
  ) {
    for (const i in this.postEventListener) {
      const e = this.postEventListener[i];
      if (this.isMatchEvent(event, e.event)) {
        e.callback(payload, response);
      }
    }
  }

  async dispatchPreTracking(
    event: string,
    payload: Record<string, any>
  ): Promise<Record<string, any>> {
    let p = payload;
    for (const i in this.preEventListener) {
      const e = this.preEventListener[i];
      if (this.isMatchEvent(event, e.event)) {
        const r = await e.callback(JSON.parse(JSON.stringify(p)), null);
        if (r == undefined) {
          return undefined;
        }
        if (r) {
          p = r;
        }
      }
    }
    return p;
  }

  async dispatchOnStartup(config: IConfig): Promise<void> {
    for (const i in this.startupListener) {
      const e = this.startupListener[i];
      e.callback(config);
    }
  }

  async dispatchOnClean(config: IConfig): Promise<void> {
    for (const i in this.cleanListener) {
      const e = this.cleanListener[i];
      e.callback(config);
    }
  }

  onClean(callback: (config: IConfig) => Promise<void>) {
    this.cleanListener.push({ callback });
  }

  onStartup(callback: (config: IConfig) => Promise<void>) {
    this.startupListener.push({ callback });
  }

  onPreTracking(event: any, callback: (payload: Record<string, any>) => any) {
    this.preEventListener.push({
      event,
      callback,
    });
  }

  onPostTracking(
    event: any,
    callback: (payload: Record<string, any>, result?: ITrackerResponse) => any
  ) {
    this.postEventListener.push({
      event,
      callback,
    });
  }
}
