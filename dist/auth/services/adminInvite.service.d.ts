export declare class AdminInviteService {
    private mailer;
    constructor();
    private buildAdminInviteLink;
    private buildHtmlTemplate;
    send(email: string, token: string): Promise<void>;
}
export declare const AdminInviteLink: AdminInviteService;
