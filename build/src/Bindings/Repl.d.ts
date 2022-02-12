import { ReplContract } from '@ioc:Adonis/Addons/Repl';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
/**
 * Define repl bindings. The method must be invoked when application environment
 * is set to repl.
 */
export declare function defineReplBindings(application: ApplicationContract, Repl: ReplContract): void;
