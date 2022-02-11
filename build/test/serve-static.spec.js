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
const path_1 = require("path");
const supertest_1 = __importDefault(require("supertest"));
const http_1 = require("http");
const test_helpers_1 = require("../test-helpers");
const Static_1 = require("../src/Hooks/Static");
japa_1.default.group('Serve Static', (group) => {
    group.afterEach(async () => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('serve static file when it exists', async (assert) => {
        await test_helpers_1.fs.add('public/style.css', 'body { background: #000 }');
        const app = await (0, test_helpers_1.setupApp)();
        const server = (0, http_1.createServer)(async (req, res) => {
            const serveStatic = new Static_1.ServeStatic((0, path_1.join)(test_helpers_1.fs.basePath, 'public'), {
                enabled: true,
            });
            const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
            await serveStatic.handle(ctx);
            assert.equal(ctx.response.response.listenerCount('finish'), 1);
            assert.isTrue(ctx.response.finished);
        });
        const { text } = await (0, supertest_1.default)(server).get('/style.css');
        assert.equal(text, 'body { background: #000 }');
    });
    (0, japa_1.default)('flush headers set before the static files hook', async (assert) => {
        await test_helpers_1.fs.add('public/style.css', 'body { background: #000 }');
        const app = await (0, test_helpers_1.setupApp)();
        const server = (0, http_1.createServer)(async (req, res) => {
            const serveStatic = new Static_1.ServeStatic((0, path_1.join)(test_helpers_1.fs.basePath, 'public'), {
                enabled: true,
            });
            const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
            ctx.response.header('x-powered-by', 'adonis');
            await serveStatic.handle(ctx);
            /**
             * Showcasing that headers has already been flushed
             */
            ctx.response.removeHeader('x-powered-by');
            assert.equal(ctx.response.response.listenerCount('finish'), 1);
            assert.isTrue(ctx.response.finished);
        });
        const { text, headers } = await (0, supertest_1.default)(server).get('/style.css');
        assert.property(headers, 'x-powered-by');
        assert.equal(headers['x-powered-by'], 'adonis');
        assert.equal(text, 'body { background: #000 }');
    });
    (0, japa_1.default)('do not flush headers when response is a 404', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        const server = (0, http_1.createServer)(async (req, res) => {
            const serveStatic = new Static_1.ServeStatic((0, path_1.join)(test_helpers_1.fs.basePath, 'public'), {
                enabled: true,
            });
            const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
            ctx.response.header('x-powered-by', 'adonis');
            await serveStatic.handle(ctx);
            ctx.response.removeHeader('x-powered-by');
            ctx.response.finish();
            assert.equal(ctx.response.response.listenerCount('finish'), 1);
            assert.isTrue(ctx.response.finished);
        });
        const { headers } = await (0, supertest_1.default)(server).get('/style.css');
        assert.notProperty(headers, 'x-powered-by');
    });
    (0, japa_1.default)('pass through when unable to lookup file', async (assert) => {
        await test_helpers_1.fs.add('public/style.css', 'body { background: #000 }');
        const app = await (0, test_helpers_1.setupApp)();
        const server = (0, http_1.createServer)(async (req, res) => {
            const serveStatic = new Static_1.ServeStatic((0, path_1.join)(test_helpers_1.fs.basePath, 'public'), {
                enabled: true,
            });
            const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
            await serveStatic.handle(ctx);
            assert.equal(ctx.response.response.listenerCount('finish'), 1);
            assert.isFalse(ctx.response.finished);
            ctx.response.status(404).send('404');
            ctx.response.finish();
        });
        await (0, supertest_1.default)(server).get('/').expect(404);
    });
    (0, japa_1.default)('allow user defined headers', async (assert) => {
        await test_helpers_1.fs.add('public/style.css', 'body { background: #000 }');
        const app = await (0, test_helpers_1.setupApp)();
        const server = (0, http_1.createServer)(async (req, res) => {
            const serveStatic = new Static_1.ServeStatic((0, path_1.join)(test_helpers_1.fs.basePath, 'public'), {
                enabled: true,
                headers(path) {
                    return {
                        'X-Custom-Path': path,
                    };
                },
            });
            const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {}, req, res);
            ctx.response.header('x-powered-by', 'adonis');
            await serveStatic.handle(ctx);
            /**
             * Showcasing that headers has already been flushed
             */
            ctx.response.removeHeader('x-powered-by');
            assert.equal(ctx.response.response.listenerCount('finish'), 1);
            assert.isTrue(ctx.response.finished);
        });
        const { text, headers } = await (0, supertest_1.default)(server).get('/style.css');
        assert.property(headers, 'x-powered-by');
        assert.property(headers, 'x-custom-path');
        assert.equal(headers['x-powered-by'], 'adonis');
        assert.equal(headers['x-custom-path'], (0, path_1.join)(test_helpers_1.fs.basePath, 'public', 'style.css'));
        assert.equal(text, 'body { background: #000 }');
    });
});
