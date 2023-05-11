export declare class ContactStateManager {
    private publicContact;
    private loginContact;
    private publicDB;
    private loginDB;
    private loginKey;
    private loginId;
    private loginStatus;
    constructor(publicDB: string, loginDB: string, loginKey: string);
    resumeSession(): void;
    setContactId(contactId: string): void;
    login(loginId: string): void;
    logout(): void;
    getLoginKey(): string;
    getLoginId(): string;
    getContactId(): string;
    getDatabase(): string;
}
