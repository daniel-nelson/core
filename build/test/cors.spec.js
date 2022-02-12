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
const supertest_1 = __importDefault(require("supertest"));
const http_1 = require("http");
const Cors_1 = require("../src/Hooks/Cors");
const cors_1 = require("./fixtures/cors");
const test_helpers_1 = require("../test-helpers");
japa_1.default.group('Cors', (group) => {
    group.afterEach(async () => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        await test_helpers_1.fs.cleanup();
    });
    cors_1.specFixtures.forEach((fixture) => {
        (0, japa_1.default)(fixture.title, async (assert) => {
            const app = await (0, test_helpers_1.setupApp)();
            const server = (0, http_1.createServer)(async (req, res) => {
                const cors = new Cors_1.Cors(fixture.configureOptions());
                fixture.configureRequest(req);
                const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
                await cors.handle(ctx);
                if (!ctx.response.hasLazyBody) {
                    ctx.response.send(null);
                }
                ctx.response.finish();
            });
            const res = await (0, supertest_1.default)(server).get('/');
            fixture.assertNormal(assert, res);
            const resOptions = await (0, supertest_1.default)(server).options('/');
            fixture.assertOptions(assert, resOptions);
        });
    });
});
