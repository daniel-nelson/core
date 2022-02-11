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
const AssetsManager_1 = require("../src/AssetsManager");
const Encore_1 = require("../src/AssetsManager/Drivers/Encore");
const test_helpers_1 = require("../test-helpers");
japa_1.default.group('AssetsManager', (group) => {
    group.beforeEach(async () => {
        await test_helpers_1.fs.fsExtra.ensureDir((0, path_1.join)(test_helpers_1.fs.basePath, 'config'));
    });
    group.afterEach(async () => {
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('get asset tag using the manager', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({}, app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    js: ['./app.js'],
                },
            },
        }));
        assert.equal(manager.entryPointScriptTags('app'), '<script src="./app.js"></script>');
    });
    (0, japa_1.default)('apply custom attributes to the script tag', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({
            script: {
                attributes: {
                    defer: true,
                },
            },
        }, app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    js: ['./app.js'],
                },
            },
        }));
        assert.equal(manager.entryPointScriptTags('app'), '<script src="./app.js" defer></script>');
    });
    (0, japa_1.default)('get style tag using the manager', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({}, app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    css: ['./app.css'],
                },
            },
        }));
        assert.equal(manager.entryPointStyleTags('app'), '<link rel="stylesheet" href="./app.css" />');
    });
    (0, japa_1.default)('raise exception when using unknown driver', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({ driver: 'vite' }, app);
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {
                app: {
                    css: ['./app.css'],
                },
            },
        }));
        assert.throw(() => manager.entryPointStyleTags('app'), 'Invalid asset driver "vite". Make sure to register the driver using the "AssetsManager.extend" method');
    });
    (0, japa_1.default)('register custom driver', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({ driver: 'vite' }, app);
        class ViteDriver extends Encore_1.EncoreDriver {
            entryPointJsFiles() {
                return ['./vite-app.js'];
            }
        }
        manager.extend('vite', ($manager) => new ViteDriver($manager.application));
        await test_helpers_1.fs.add('public/assets/entrypoints.json', JSON.stringify({
            entrypoints: {},
        }));
        assert.equal(manager.entryPointScriptTags('app'), '<script src="./vite-app.js"></script>');
    });
    (0, japa_1.default)('get assets version', async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({
            script: {
                attributes: {
                    defer: true,
                },
            },
        }, app);
        await test_helpers_1.fs.add('public/assets/manifest.json', JSON.stringify({
            app: './app.js',
        }));
        assert.equal(manager.version, 'c46a678581');
    });
    (0, japa_1.default)("raise exception when using entrypoints and driver doesn't support it", async (assert) => {
        const app = new application_1.Application(test_helpers_1.fs.basePath, 'test', {});
        await app.setup();
        const manager = new AssetsManager_1.AssetsManager({ driver: 'vite' }, app);
        class ViteDriver extends Encore_1.EncoreDriver {
            constructor() {
                super(...arguments);
                this.hasEntrypoints = false;
                this.name = 'vite';
            }
        }
        manager.extend('vite', ($manager) => new ViteDriver($manager.application));
        assert.throw(() => manager.entryPointScriptTags('app'), 'Cannot reference entrypoints. The "vite" driver does not support entrypoints');
    });
});
