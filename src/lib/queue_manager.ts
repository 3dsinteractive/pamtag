import { JobType } from "./enums/enums";

export type RequestJob<T> = {
  jobType?: JobType;
  event: string;
  trackingConsentMessageId: string;
  data?: Record<string, any>;
  flushEventBefore: boolean;
  resolve?: (value: T | PromiseLike<T>) => void;
  reject?: (reason?: any) => void;
};

export class QueueManager<T> {
  private jobs: RequestJob<T>[] = [];
  private running = false;
  private waitingForBulk = false;
  private bulkTimeout;

  public callback: (job: RequestJob<T>[]) => Promise<T[]>;

  constructor(
    bulkTimeout: number,
    callback: (job: RequestJob<T>[]) => Promise<T[]>
  ) {
    this.bulkTimeout = bulkTimeout;
    this.callback = callback;
  }

  enqueueJob(job: RequestJob<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      job.reject = reject;
      job.resolve = resolve;
      this.jobs.push(job);
      if (!this.running && !this.waitingForBulk) {
        this.waitingForBulk = true;

        setTimeout(() => {
          this.waitingForBulk = false;
          this.runQueue();
        }, this.bulkTimeout);
      }
    });
  }

  private async runQueue(): Promise<void> {
    this.running = true;
    while (this.jobs.length > 0) {
      const jobs: RequestJob<T>[] = [];

      while (this.jobs.length > 0 && !this.jobs[0].flushEventBefore) {
        const job = this.jobs.shift();
        jobs.push(job);
      }

      try {
        const result = await this.callback(jobs);

        for (const i in result) {
          const r = result[i];
          jobs[i].resolve(r);
        }
      } catch (error) {
        jobs.forEach((j) => j.reject(error));
      }
    }
    this.running = false;
  }
}
