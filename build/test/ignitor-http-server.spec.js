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
const Ignitor_1 = require("../src/Ignitor");
const test_helpers_1 = require("../test-helpers");
japa_1.default.group('Ignitor | Http', (group) => {
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
    (0, japa_1.default)('call ready hook on providers before starting the http server', async (assert, done) => {
        await test_helpers_1.fs.add('providers/AppProvider.ts', `
    export default class AppProvider {
			constructor (protected $app) {}

			public static needsApplication = true

      public async ready () {
        this.$app.container.use('Adonis/Core/Server').hookCalled = true
      }
    }
    `);
        await (0, test_helpers_1.setupApplicationFiles)(['./providers/AppProvider']);
        const httpServer = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath).httpServer();
        await httpServer.start();
        const server = httpServer.application.container.use('Adonis/Core/Server');
        server.instance.close(() => {
            done();
        });
        assert.isTrue(server['hookCalled']);
    });
    (0, japa_1.default)('start http server to accept incoming requests', async (assert, done) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.application.setup();
        await httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        /**
         * Define routes
         */
        const server = httpServer.application.container.use('Adonis/Core/Server');
        httpServer.application.container.use('Adonis/Core/Route').get('/', async () => 'handled');
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        assert.isTrue(httpServer.application.isReady);
        const { text } = await (0, supertest_1.default)(server.instance).get('/').expect(200);
        server.instance.close();
        setTimeout(() => {
            assert.isFalse(httpServer.application.isReady);
            assert.equal(text, 'handled');
            done();
        }, 100);
    });
    (0, japa_1.default)('forward errors to app error handler', async (assert, done) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('app/Exceptions/Handler.ts', `
	      export default class Handler {
	        async handle (error) {
	          return \`handled \${error.message}\`
	        }

	        report () {
	        }
	      }
	    `);
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: true,
            autoloads: {
                App: './app',
            },
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
            exceptionHandlerNamespace: 'App/Exceptions/Handler',
        }));
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.application.setup();
        await httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        const server = httpServer.application.container.use('Adonis/Core/Server');
        const { text } = await (0, supertest_1.default)(server.instance).get('/').expect(404);
        server.instance.close(() => {
            done();
        });
        assert.equal(text, 'handled E_ROUTE_NOT_FOUND: Cannot GET:/');
    });
    (0, japa_1.default)('kill app when server receives error', async (assert) => {
        assert.plan(1);
        await (0, test_helpers_1.setupApplicationFiles)();
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        httpServer.application.setup();
        httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        httpServer.kill = async function kill() {
            assert.isTrue(true);
            server.instance.close();
        };
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        const server = httpServer.application.container.use('Adonis/Core/Server');
        server.instance.emit('error', new Error());
    });
    (0, japa_1.default)('close http server gracefully when closing the app', async (assert, done) => {
        assert.plan(2);
        await (0, test_helpers_1.setupApplicationFiles)();
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        const server = httpServer.application.container.use('Adonis/Core/Server');
        server.instance.on('close', () => {
            assert.isTrue(true);
            assert.isFalse(httpServer.application.isReady);
            done();
        });
        await httpServer.close();
    });
    (0, japa_1.default)('invoke shutdown method when gracefully closing the app', async (assert) => {
        await test_helpers_1.fs.add('providers/AppProvider.ts', `
	    export default class AppProvider {
				constructor (protected $app) {}

				public static needsApplication = true

	      public async shutdown () {
	        this.$app.container.use('Adonis/Core/Server').hookCalled = true
	      }
	    }
	    `);
        await (0, test_helpers_1.setupApplicationFiles)(['./providers/AppProvider']);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        const server = httpServer.application.container.use('Adonis/Core/Server');
        await httpServer.close();
        assert.isTrue(server['hookCalled']);
    });
});
japa_1.default.group('Ignitor | HTTP | Static Assets', (group) => {
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
    (0, japa_1.default)('serve static files when static hooks is enabled', async (assert, done) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/static.ts', `
	      export const enabled = true
	    `);
        await test_helpers_1.fs.add('public/style.css', 'body { background: #000 }');
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.application.setup();
        await httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        const server = httpServer.application.container.use('Adonis/Core/Server');
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        assert.isTrue(httpServer.application.isReady);
        const { text } = await (0, supertest_1.default)(server.instance).get('/style.css').expect(200);
        server.instance.close();
        setTimeout(() => {
            assert.isFalse(httpServer.application.isReady);
            assert.equal(text, 'body { background: #000 }');
            done();
        }, 100);
    });
    (0, japa_1.default)('serve static files from a custom public path', async (assert, done) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/static.ts', `
	      export const enabled = true
	    `);
        /**
         * Overwriting .adonisrc.json
         */
        const existingContent = await test_helpers_1.fs.get('.adonisrc.json');
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify(Object.assign(JSON.parse(existingContent), {
            directories: {
                public: 'www',
            },
        })));
        await test_helpers_1.fs.add('www/style.css', 'body { background: #000 }');
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.application.setup();
        await httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        const server = httpServer.application.container.use('Adonis/Core/Server');
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        assert.isTrue(httpServer.application.isReady);
        const { text } = await (0, supertest_1.default)(server.instance).get('/style.css').expect(200);
        server.instance.close();
        setTimeout(() => {
            assert.isFalse(httpServer.application.isReady);
            assert.equal(text, 'body { background: #000 }');
            done();
        }, 100);
    });
});
japa_1.default.group('Ignitor | HTTP | CORS', (group) => {
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
    (0, japa_1.default)('respond to pre-flight requests when cors are enabled', async (assert, done) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        await test_helpers_1.fs.add('config/cors.ts', `
	      export const enabled = true
	      export const exposeHeaders = []
	      export const methods = ['GET']
	      export const origin = true
	      export const headers = true
	    `);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        const httpServer = ignitor.httpServer();
        await httpServer.application.setup();
        await httpServer.application.registerProviders();
        await httpServer.application.bootProviders();
        const server = httpServer.application.container.use('Adonis/Core/Server');
        await httpServer.start((handler) => (0, http_1.createServer)(handler));
        assert.isTrue(httpServer.application.isReady);
        const { header } = await (0, supertest_1.default)(server.instance)
            .options('/')
            .set('origin', 'foo.com')
            .set('Access-Control-Request-Method', 'GET')
            .expect(204);
        server.instance.close();
        setTimeout(() => {
            assert.isFalse(httpServer.application.isReady);
            assert.equal(header['access-control-allow-origin'], 'foo.com');
            assert.equal(header['access-control-allow-methods'], 'GET');
            done();
        }, 100);
    });
});
