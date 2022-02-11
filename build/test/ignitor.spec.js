"use strict";
/*
 * @adonisjs/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../adonis-typings/index.ts" />
const japa_1 = __importDefault(require("japa"));
const url_1 = require("url");
const Ignitor_1 = require("../src/Ignitor");
const test_helpers_1 = require("../test-helpers");
japa_1.default.group('Ignitor | App Provider', (group) => {
    group.before(() => {
        process.env.ENV_SILENT = 'true';
    });
    group.beforeEach(() => {
        process.env.NODE_ENV = 'testing';
    });
    group.after(async () => {
        await test_helpers_1.fs.cleanup();
        delete process.env.ENV_SILENT;
        delete process.env.APP_KEY;
    });
    group.afterEach(async () => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        delete process.env.NODE_ENV;
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('setup cors before hooks when enabled is set to true', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/cors.ts', `
      export const enabled = true
      export const exposeHeaders = []
    `);
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const Server = httpServer.application.container.use('Adonis/Core/Server');
        assert.lengthOf(Server.hooks['hooks'].before, 1);
        await httpServer.close();
    });
    (0, japa_1.default)('setup cors before hooks when enabled is set to a function', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/cors.ts', `
      export const enabled = () => false
      export const exposeHeaders = []
    `);
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const Server = httpServer.application.container.use('Adonis/Core/Server');
        assert.lengthOf(Server.hooks['hooks'].before, 1);
        await httpServer.close();
    });
    (0, japa_1.default)('do not setup cors before hooks when enabled is set to false', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/cors.ts', `
      export const enabled = false
      export const exposeHeaders = []
    `);
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const Server = httpServer.application.container.use('Adonis/Core/Server');
        assert.lengthOf(Server.hooks['hooks'].before, 0);
        await httpServer.close();
    });
    (0, japa_1.default)('setup static assets before hooks when enabled is set to true', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/static.ts', `
      export const enabled = true
    `);
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const Server = httpServer.application.container.use('Adonis/Core/Server');
        assert.lengthOf(Server.hooks['hooks'].before, 1);
        await httpServer.close();
    });
    (0, japa_1.default)('register base health checkers', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const HealthCheck = httpServer.application.container.use('Adonis/Core/HealthCheck');
        assert.deepEqual(HealthCheck.servicesList, ['env', 'appKey']);
        await httpServer.close();
    });
    (0, japa_1.default)('construct ignitor with a file URL', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        const entryPoint = test_helpers_1.fs.basePath + '/ace.js';
        const url = (0, url_1.pathToFileURL)(entryPoint).href;
        const httpServer = new Ignitor_1.Ignitor(url).httpServer();
        assert.strictEqual(httpServer.application.appRoot, test_helpers_1.fs.basePath);
    });
});
