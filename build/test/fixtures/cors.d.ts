import { IncomingMessage } from 'http';
import { Assert } from 'japa/build/src/Assert';
import { CorsConfig } from '@ioc:Adonis/Core/Cors';
/**
 * Fixtures that tests the cors functionality as
 * per https://www.w3.org/TR/cors/ RFC.
 */
export declare const specFixtures: {
    title: string;
    configureOptions(): CorsConfig;
    configureRequest(req: IncomingMessage): void;
    assertNormal(assert: Assert, res: any): void;
    assertOptions(assert: Assert, res: any): void;
}[];
