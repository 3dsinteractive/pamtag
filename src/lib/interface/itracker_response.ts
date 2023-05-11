export interface ITrackerResponse {
  contact_id: string;
  consent_id?: string;
  _database?: string;
}

export interface IBulkTrackerResponse {
  results: ITrackerResponse[];
}
