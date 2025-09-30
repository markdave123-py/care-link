export declare class LocalEmbeddings {
    private extractorPromise;
    embed(text: string): Promise<number[]>;
}
