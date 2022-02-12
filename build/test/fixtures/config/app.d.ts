/**
 * Config source: https://git.io/JfefZ
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */
export declare const appKey: string;
export declare const http: {
    allowMethodSpoofing: boolean;
    subdomainOffset: number;
    generateRequestId: boolean;
    trustProxy: any;
    etag: boolean;
    jsonpCallbackName: string;
    cookie: {
        domain: string;
        path: string;
        maxAge: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: boolean;
    };
    forceContentNegotiationToJSON: boolean;
};
export declare const logger: {
    name: string;
    enabled: boolean;
    level: string;
    prettyPrint: boolean;
};
export declare const profiler: {
    enabled: boolean;
    blacklist: never[];
    whitelist: never[];
};
