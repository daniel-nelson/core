/**
 * Exposes the API to generate the manifest file
 */
export declare class GenerateManifest {
    private appRoot;
    private application;
    /**
     * Source root always points to the compiled source
     * code.
     */
    constructor(appRoot: string);
    /**
     * Returns manifest object for showing help
     */
    static getManifestJSON(): {
        commandName: string;
        description: string;
        args: never[];
        flags: never[];
        settings: {};
        aliases: never[];
        commandPath: string;
    };
    /**
     * Generates the manifest file for commands
     */
    handle(): Promise<void>;
}
