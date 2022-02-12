import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
/**
 * Configure package
 */
export default function instructions(projectRoot: string, _: ApplicationContract, { logger, files }: typeof sinkStatic): Promise<void>;
