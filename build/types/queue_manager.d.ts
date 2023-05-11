import { JobType } from "./enums/enums";
export type RequestJob<T> = {
    jobType?: JobType;
    event: string;
    trackingConsentMessageId: string;
    data?: Record<string, any>;
    headers?: Record<string, any>;
    flushEventBefore: boolean;
    resolve?: (value: T | PromiseLike<T>) => void;
    reject?: (reason?: any) => void;
};
export declare class QueueManager<T> {
    private jobs;
    private running;
    callback: (job: RequestJob<T>) => Promise<T>;
    constructor(callback: (job: RequestJob<T>) => Promise<T>);
    enqueueJob(job: RequestJob<T>): Promise<T>;
    private runQueue;
}
