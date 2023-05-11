export declare class HTTPClient {
    private baseUrl;
    constructor(baseUrl: string);
    get(endpoint: string, headers: {
        [key: string]: string;
    }): Promise<any>;
    put(endpoint: string, body: any): Promise<any>;
    post(endpoint: string, body: any, headers: Record<string, string>): Promise<any>;
}
