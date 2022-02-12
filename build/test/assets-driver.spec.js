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
const path_1 = require("path");
const application_1 = require("@adonisjs/application");
const Encore_1 = require("../src/AssetsManager/Drivers/Encore");
const test_helpers_1 = require("../test-helpers");
japa_1.default.group('Encore Driver', (group) => {
    group.beforeEach(async () => {
        await test_helpers_1.fs.fsExtra.ensureDir((0, path_1.join)(test_helpers_1.fs.basePath, 'config'));
    });
    group.afterEach(async () => {
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('raise exception when manifest.json file is missing', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        assert.throw(() => driver.manifest(), `Cannot find "${app.publicPath('assets/manifest.json')}"`);
    });
    (0, japa_1.default)('raise exception when entrypoints.json file is missing', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        assert.throw(() => driver.entryPoints(), `Cannot find "${app.publicPath('assets/entrypoints.json')}"`);
    });
    (0, japa_1.default)('get manifest data', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/manifest.json', JSON.stringify({
            'app.js': './app.js',
        }));
        assert.deepEqual(driver.manifest(), { 'app.js': './app.js' });
    });
    (0, japa_1.default)('get entrypoints data', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    js: ['./app.js'],
                },
            },
        }));
        assert.deepEqual(driver.entryPoints(), {
            app: {
                js: ['./app.js'],
            },
        });
    });
    (0, japa_1.default)('get entrypoints js files', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    js: ['./app.js'],
                },
            },
        }));
        assert.deepEqual(driver.entryPointJsFiles('app'), ['./app.js']);
    });
    (0, japa_1.default)('get entrypoints css files', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    css: ['./app.css'],
                },
            },
        }));
        assert.deepEqual(driver.entryPointCssFiles('app'), ['./app.css']);
    });
    (0, japa_1.default)('get empty array when js files are not in defined', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {},
            },
        }));
        assert.deepEqual(driver.entryPointJsFiles('app'), []);
    });
    (0, japa_1.default)('get empty array when css files are not in defined', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {},
            },
        }));
        assert.deepEqual(driver.entryPointCssFiles('app'), []);
    });
    (0, japa_1.default)('raise exception when entrypoint itself is missing', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {},
        }));
        assert.throw(() => driver.entryPointJsFiles('app'), 'Cannot find assets for "app" entrypoint. Make sure you are compiling assets');
        assert.throw(() => driver.entryPointCssFiles('app'), 'Cannot find assets for "app" entrypoint. Make sure you are compiling assets');
    });
    (0, japa_1.default)('get path for a given asset', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/manifest.json', JSON.stringify({
            './app.js': './app-123.js',
        }));
        assert.equal(driver.assetPath('./app.js'), './app-123.js');
    });
    (0, japa_1.default)('raise exception when asset path is missing', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const driver = new Encore_1.EncoreDriver(app);
        await test_helpers_1.fs.add('public/assets/manifest.json', JSON.stringify({}));
        assert.throw(() => driver.assetPath('app'), 'Cannot find path for "app" asset. Make sure you are compiling assets');
    });
});
