"use strict";
/*
 * @adonisjs/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateManifest = void 0;
const cliui_1 = require("@poppinss/cliui");
const ace_1 = require("@adonisjs/ace");
const application_1 = require("@adonisjs/application");
const ErrorHandler_1 = require("../ErrorHandler");
const utils_1 = require("../../../utils");
const Exceptions_1 = require("../Exceptions");
/**
 * Exposes the API to generate the manifest file
 */
class GenerateManifest {
    /**
     * Source root always points to the compiled source
     * code.
     */
    constructor(appRoot) {
        this.appRoot = appRoot;
        this.application = new application_1.Application(this.appRoot, 'console');
    }
    /**
     * Returns manifest object for showing help
     */
    static getManifestJSON() {
        return {
            commandName: 'generate:manifest',
            description: 'Generate ace commands manifest file. Manifest file speeds up commands lookup',
            args: [],
            flags: [],
            settings: {},
            aliases: [],
            commandPath: '',
        };
    }
    /**
     * Generates the manifest file for commands
     */
    async handle() {
        try {
            /**
             * Register ts hook when running typescript code directly
             */
            if (this.application.rcFile.typescript) {
                (0, utils_1.registerTsHook)(this.application.appRoot);
            }
            const commands = this.application.rcFile.commands;
            /**
             * Generating manifest requires us to import the command files to read their
             * meta data defined as class static properties. However, at this stage
             * the application is not booted and hence top level IoC container
             * imports will break
             */
            this.application.container.trap((namespace) => {
                if (namespace === 'Adonis/Core/Application') {
                    return this.application;
                }
                return {
                    __esModule: new Proxy({ namespace }, {
                        get(target) {
                            throw new Exceptions_1.AceRuntimeException(`Top level import for module "${target.namespace}" is not allowed in commands. Learn more https://preview.adonisjs.com/guides/ace/introduction`);
                        },
                    }),
                };
            });
            await new ace_1.ManifestGenerator(this.appRoot, commands).generate();
            cliui_1.logger.action('create').succeeded('ace-manifest.json file');
        }
        catch (error) {
            await new ErrorHandler_1.ErrorHandler(this.application).handleError(error);
        }
    }
}
exports.GenerateManifest = GenerateManifest;
