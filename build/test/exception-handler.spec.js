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
const japa_1 = __importDefault(require("japa"));
const logger_1 = require("@adonisjs/logger");
const utils_1 = require("@poppinss/utils");
const test_helpers_1 = require("../test-helpers");
const HttpExceptionHandler_1 = require("../src/HttpExceptionHandler");
japa_1.default.group('HttpExceptionHandler', (group) => {
    group.afterEach(async () => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        await test_helpers_1.fs.cleanup();
        delete process.env.NODE_ENV;
    });
    (0, japa_1.default)('do not report error if error code is in ignore list', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.ignoreCodes = ['E_BAD_REQUEST'];
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        const handler = new AppHandler(fakeLogger);
        handler.report(new utils_1.Exception('bad request', 500, 'E_BAD_REQUEST'), ctx);
        assert.deepEqual(fakeLogger.logs, []);
    });
    (0, japa_1.default)('report error when not inside ignore list', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        app.logger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        const handler = new AppHandler(app.logger);
        handler.report(new utils_1.Exception('bad request', 500, 'E_BAD_REQUEST'), ctx);
        assert.deepEqual(ctx.logger.logs.map(({ level, msg }) => {
            return { level, msg };
        }), [
            {
                level: 50,
                msg: 'E_BAD_REQUEST: bad request',
            },
        ]);
    });
    (0, japa_1.default)('ignore http status inside the ignore list', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        app.logger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.ignoreStatuses = [500];
                this.dontReport = [];
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        const handler = new AppHandler(app.logger);
        handler.report(new utils_1.Exception('bad request', 500, 'E_BAD_REQUEST'), ctx);
        assert.deepEqual(app.logger.logs, []);
    });
    (0, japa_1.default)('report error with custom context', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        app.logger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        const handler = new AppHandler(app.logger);
        handler.report(new utils_1.Exception('bad request', 500, 'E_BAD_REQUEST'), ctx);
        assert.deepEqual(app.logger.logs.map(({ level, msg, username }) => {
            return { level, msg, username };
        }), [
            {
                level: 50,
                username: 'virk',
                msg: 'E_BAD_REQUEST: bad request',
            },
        ]);
    });
    (0, japa_1.default)('call error report method if it exists', async (assert) => {
        assert.plan(1);
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            report() {
                assert.isTrue(true);
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        const handler = new AppHandler(fakeLogger);
        handler.report(new InvalidAuth('bad request'), ctx);
    });
    (0, japa_1.default)('handle exception by returning html', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.deepEqual(ctx.response.lazyBody, ['<h1> bad request </h1>', undefined]);
    });
    (0, japa_1.default)('handle exception by returning json', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'application/json' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.deepEqual(ctx.response.lazyBody, [{ message: 'bad request' }, undefined]);
    });
    (0, japa_1.default)('handle exception by returning json api response', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'application/vnd.api+json' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.deepEqual(ctx.response.lazyBody, [
            {
                errors: [
                    {
                        title: 'bad request',
                        status: 500,
                        code: undefined,
                    },
                ],
            },
            undefined,
        ]);
    });
    (0, japa_1.default)('return stack trace when NODE_ENV=development', async (assert) => {
        process.env.NODE_ENV = 'development';
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'application/json' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.exists(ctx.response.lazyBody[0].stack);
    });
    (0, japa_1.default)('print youch html in development', async (assert) => {
        process.env.NODE_ENV = 'development';
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.isTrue(/youch/.test(ctx.response.lazyBody[0]));
    });
    (0, japa_1.default)('call handle on actual exception when method exists', async (assert) => {
        assert.plan(1);
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            async handle() {
                assert.isTrue(true);
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
    });
    (0, japa_1.default)('use return value of exception handle method', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            async handle() {
                return 'foo';
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        const response = await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.equal(response, 'foo');
    });
    (0, japa_1.default)('render status page when defined', async (assert) => {
        assert.plan(3);
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    404: '404.edge',
                };
            }
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            constructor(message) {
                super(message, 404, 'E_INVALID_AUTH');
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        ctx['view'] = {
            async render(view, data) {
                assert.equal(view, '404.edge');
                assert.equal(data.error.message, 'E_INVALID_AUTH: bad request');
            },
        };
        ctx.request.request.headers = { accept: 'text/html' };
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.equal(ctx.response.response.statusCode, 404);
    });
    (0, japa_1.default)('do not render status page when content negotiation passes for json', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    404: '404.edge',
                };
            }
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            constructor(message) {
                super(message, 404, 'E_INVALID_AUTH');
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'application/json' };
        const handler = new AppHandler(fakeLogger);
        ctx['view'] = {
            async render() {
                throw new Error('Not expected');
            },
        };
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.deepEqual(ctx.response.lazyBody, [{ message: 'E_INVALID_AUTH: bad request' }, undefined]);
        assert.equal(ctx.response.response.statusCode, 404);
    });
    (0, japa_1.default)('do not render status page when disabled for development mode', async (assert) => {
        process.env.NODE_ENV = 'development';
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    404: '404.edge',
                };
                this.disableStatusPagesInDevelopment = true;
            }
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            constructor(message) {
                super(message, 404, 'E_INVALID_AUTH');
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        const handler = new AppHandler(fakeLogger);
        ctx['view'] = {
            async render() {
                throw new Error('Not expected');
            },
        };
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.isTrue(/youch/.test(ctx.response.lazyBody[0]));
        assert.equal(ctx.response.response.statusCode, 404);
    });
    (0, japa_1.default)('always render status page when in production mode', async (assert) => {
        assert.plan(3);
        process.env.NODE_ENV = 'production';
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    404: '404.edge',
                };
                this.disableStatusPagesInDevelopment = true;
            }
            context() {
                return { username: 'virk' };
            }
        }
        class InvalidAuth extends utils_1.Exception {
            constructor(message) {
                super(message, 404, 'E_INVALID_AUTH');
            }
        }
        const ctx = app.container.use('Adonis/Core/HttpContext').create('/', {});
        ctx.request.request.headers = { accept: 'text/html' };
        ctx['view'] = {
            async render(view, data) {
                assert.equal(view, '404.edge');
                assert.equal(data.error.message, 'E_INVALID_AUTH: bad request');
            },
        };
        const handler = new AppHandler(fakeLogger);
        await handler.handle(new InvalidAuth('bad request'), ctx);
        assert.equal(ctx.response.response.statusCode, 404);
    });
    (0, japa_1.default)('compute status pages from expression', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    '500..509': '500.edge',
                };
            }
            context() {
                return { username: 'virk' };
            }
        }
        const handler = new AppHandler(fakeLogger);
        assert.deepEqual(handler.expandedStatusPages, {
            500: '500.edge',
            501: '500.edge',
            502: '500.edge',
            503: '500.edge',
            504: '500.edge',
            505: '500.edge',
            506: '500.edge',
            507: '500.edge',
            508: '500.edge',
            509: '500.edge',
        });
    });
    (0, japa_1.default)('ensure expandedStatusPages is a singleton', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)();
        app.container.useProxies();
        const fakeLogger = new logger_1.FakeLogger({ enabled: true, name: 'adonisjs', level: 'info' });
        app.container.fake('Adonis/Core/Logger', () => fakeLogger);
        class AppHandler extends HttpExceptionHandler_1.HttpExceptionHandler {
            constructor() {
                super(...arguments);
                this.statusPages = {
                    '500..509': '500.edge',
                };
            }
            context() {
                return { username: 'virk' };
            }
        }
        const appHandler = new AppHandler(fakeLogger);
        assert.deepEqual(appHandler.expandedStatusPages, {
            500: '500.edge',
            501: '500.edge',
            502: '500.edge',
            503: '500.edge',
            504: '500.edge',
            505: '500.edge',
            506: '500.edge',
            507: '500.edge',
            508: '500.edge',
            509: '500.edge',
        });
        appHandler['statusPages'] = {
            '500..502': '500.edge',
        };
        assert.deepEqual(appHandler.expandedStatusPages, {
            500: '500.edge',
            501: '500.edge',
            502: '500.edge',
            503: '500.edge',
            504: '500.edge',
            505: '500.edge',
            506: '500.edge',
            507: '500.edge',
            508: '500.edge',
            509: '500.edge',
        });
    });
});
