import { ITrackerResponse } from "../interface/itracker_response";

interface HookListener {
  event: any;
  callback: (
    payload: Record<string, any>,
    result?: ITrackerResponse
  ) => Promise<any>;
}

export class Hook {
  constructor() {}

  preEventListener: HookListener[] = [];
  postEventListener: HookListener[] = [];

  private isMatchEvent(srcEvent: string, listen: any) {
    if (listen === "*") {
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
        const r = e.callback(JSON.parse(JSON.stringify(p)), null);
        if (r) {
          p = r;
        }
      }
    }
    return p;
  }

  onPreTracking(event: any, callback: (payload: Record<string, any>) => any) {
    this.preEventListener.push({
      event: event,
      callback: callback,
    });
  }

  onPostTracking(
    event: any,
    callback: (payload: Record<string, any>, result?: ITrackerResponse) => any
  ) {
    this.postEventListener.push({
      event: event,
      callback: callback,
    });
  }
}
