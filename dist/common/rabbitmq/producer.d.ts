type Data = {
    email: string;
    token: string;
    type?: string;
};
export declare class PublishToQueue {
    static email: (key: string, data: Data) => Promise<void>;
}
export {};
