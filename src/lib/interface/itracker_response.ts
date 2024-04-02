export interface ITrackerResponse {
  contact_id?: string;
  consent_id?: string;
  _database?: string;
  cancelled?: boolean;
}

export interface IBulkTrackerResponse {
  results: ITrackerResponse[];
}
