export declare class AdminInviteService {
    private mailer;
    constructor();
    private buildAdminInviteLink;
    private buildHtmlTemplate;
    send(token: string, email: string): Promise<void>;
}
export declare const AdminInviteLink: AdminInviteService;
