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
require("reflect-metadata");
const fold_1 = require("@adonisjs/fold");
const ace_1 = require("@adonisjs/ace");
const cliui_1 = require("@poppinss/cliui");
const application_1 = require("@adonisjs/application");
const Router_1 = require("@adonisjs/http-server/build/src/Router");
const index_1 = require("@adonisjs/http-server/build/src/Server/PreCompiler/index");
const ListRoutes_1 = __importDefault(require("../commands/ListRoutes"));
const ioc = new fold_1.Ioc();
const precompiler = new index_1.PreCompiler(ioc, {
    get() { },
    getNamed(name) {
        return { name };
    },
});
japa_1.default.group('Command | List Routes', (group) => {
    group.afterEach(() => {
        cliui_1.testingRenderer.logs = [];
    });
    (0, japa_1.default)('list routes in the order they are register', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        router.get('about', async () => { });
        router.get('contact', async () => { });
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        listRoutes.json = true;
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                root: [
                    {
                        methods: ['HEAD', 'GET'],
                        name: '',
                        pattern: '/about',
                        handler: 'Closure',
                        middleware: [],
                    },
                    {
                        methods: ['HEAD', 'GET'],
                        name: '',
                        pattern: '/contact',
                        handler: 'Closure',
                        middleware: [],
                    },
                ],
            },
        ]);
    });
    (0, japa_1.default)('list routes with assigned middleware', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        router.get('about', async () => { });
        router.get('contact', async () => { }).middleware(['auth', 'acl:admin']);
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        listRoutes.json = true;
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                root: [
                    {
                        methods: ['HEAD', 'GET'],
                        name: '',
                        pattern: '/about',
                        handler: 'Closure',
                        middleware: [],
                    },
                    {
                        methods: ['HEAD', 'GET'],
                        name: '',
                        pattern: '/contact',
                        handler: 'Closure',
                        middleware: ['auth', 'acl:admin'],
                    },
                ],
            },
        ]);
    });
    (0, japa_1.default)('list routes with controller handlers', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        ioc.bind('App/Controllers/Http/HomeController', () => { });
        ioc.bind('App/Controllers/Http/ContactController', () => { });
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        router.get('about', 'HomeController.index');
        router.get('contact', 'ContactController');
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.json = true;
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                root: [
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/about',
                        name: '',
                        handler: 'HomeController.index',
                        middleware: [],
                    },
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/contact',
                        name: '',
                        handler: 'ContactController.handle',
                        middleware: [],
                    },
                ],
            },
        ]);
    });
    (0, japa_1.default)('output complete controller namespace when using a custom namespace', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        ioc.bind('App/Controllers/Http/HomeController', () => { });
        ioc.bind('App/Admin/ContactController', () => { });
        router.get('about', 'HomeController.index');
        router.get('contact', 'ContactController').namespace('App/Admin');
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.json = true;
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                root: [
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/about',
                        name: '',
                        handler: 'HomeController.index',
                        middleware: [],
                    },
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/contact',
                        name: '',
                        handler: 'App/Admin/ContactController.handle',
                        middleware: [],
                    },
                ],
            },
        ]);
    });
    (0, japa_1.default)('output route custom domain', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        router.get('about', async () => { }).domain('blogger.com');
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.json = true;
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                'blogger.com': [
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/about',
                        handler: 'Closure',
                        name: '',
                        middleware: [],
                    },
                ],
            },
        ]);
    });
    (0, japa_1.default)('prefix route group pattern', async (assert) => {
        const app = new application_1.Application(__dirname, 'test', {});
        const router = new Router_1.Router({}, precompiler.compileRoute.bind(precompiler));
        router
            .group(() => {
            router.get('about', async () => { }).domain('blogger.com');
        })
            .prefix('v1');
        router.commit();
        app.container.bind('Adonis/Core/Route', () => router);
        const listRoutes = new ListRoutes_1.default(app, new ace_1.Kernel(app));
        listRoutes.json = true;
        listRoutes.logger.useRenderer(cliui_1.testingRenderer);
        await listRoutes.run();
        assert.deepEqual(cliui_1.testingRenderer.logs.map(({ message }) => JSON.parse(message)), [
            {
                'blogger.com': [
                    {
                        methods: ['HEAD', 'GET'],
                        pattern: '/v1/about',
                        handler: 'Closure',
                        name: '',
                        middleware: [],
                    },
                ],
            },
        ]);
    });
});
