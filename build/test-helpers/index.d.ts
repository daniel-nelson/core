import { Filesystem } from '@poppinss/dev-utils';
import { Application } from '@adonisjs/application';
export declare const fs: Filesystem;
/**
 * Setup application files for testing
 */
export declare function setupApplicationFiles(additionalProviders?: string[], serveFiles?: boolean): Promise<void>;
/**
 * Setup application for testing
 */
export declare function setupApp(additionalProviders?: string[], serveAssets?: boolean): Promise<Application>;
export declare function registerBodyParserMiddleware(app: Application): Promise<void>;
