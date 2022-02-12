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
const strip_ansi_1 = __importDefault(require("strip-ansi"));
const test_console_1 = require("test-console");
const Ignitor_1 = require("../src/Ignitor");
const test_helpers_1 = require("../test-helpers");
let processExit = process.exit;
japa_1.default.group('Ignitor | Ace | Generate Manifest', (group) => {
    group.beforeEach(() => {
        // @ts-ignore
        process.exit = function () { };
    });
    group.after(async () => {
        await test_helpers_1.fs.cleanup();
    });
    group.afterEach(async () => {
        process.exit = processExit;
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('generate manifest file', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        const { output, restore } = test_console_1.stdout.inspect();
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: false,
            commands: ['./FooCommand'],
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
        }));
        await test_helpers_1.fs.add('FooCommand.ts', `
      const { BaseCommand } = require('@adonisjs/ace')
      module.exports = class FooCommand extends BaseCommand {
        static get commandName () {
          return 'foo'
        }

        run () {}
      }
    `);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        await ignitor.ace().handle(['generate:manifest']);
        restore();
        const aceManifest = await test_helpers_1.fs.fsExtra.readJson((0, path_1.join)(test_helpers_1.fs.basePath, './ace-manifest.json'));
        assert.deepEqual(aceManifest, {
            commands: {
                foo: {
                    settings: {},
                    aliases: [],
                    commandPath: './FooCommand',
                    commandName: 'foo',
                    description: '',
                    args: [],
                    flags: [],
                },
            },
            aliases: {},
        });
        assert.equal((0, strip_ansi_1.default)(output[0]).split('CREATE:')[1].trim(), 'ace-manifest.json file');
    });
    (0, japa_1.default)('print helpful error message when command is using ioc container imports', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        const { output, restore } = test_console_1.stderr.inspect();
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: false,
            commands: ['./FooCommand'],
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
        }));
        await test_helpers_1.fs.add('FooCommand.ts', `
			import { BaseCommand } from '@adonisjs/ace'
			global[Symbol.for('ioc.use')]('Adonis/Core/Env').__esModule.get('')

			export default class FooCommand extends BaseCommand {
        static get commandName () {
          return 'foo'
        }

        run () {}
      }
    `);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        await ignitor.ace().handle(['generate:manifest']);
        restore();
        const hasManifestFile = await test_helpers_1.fs.fsExtra.pathExists((0, path_1.join)(test_helpers_1.fs.basePath, './ace-manifest.json'));
        assert.isFalse(hasManifestFile);
        assert.match((0, strip_ansi_1.default)(output[0]).trim(), /Top level import for module "Adonis\/Core\/Env" is not allowed in commands/);
    });
});
japa_1.default.group('Ignitor | Ace | Core Commands', (group) => {
    group.beforeEach(() => {
        // @ts-ignore
        process.exit = function () { };
    });
    group.after(async () => {
        await test_helpers_1.fs.cleanup();
    });
    group.afterEach(async () => {
        process.exit = processExit;
        await test_helpers_1.fs.cleanup();
    });
});
japa_1.default.group('Ignitor | Ace | Run Command', (group) => {
    group.beforeEach(() => {
        // @ts-ignore
        process.exit = function () { };
    });
    group.after(async () => {
        await test_helpers_1.fs.cleanup();
    });
    group.afterEach(async () => {
        process.exit = processExit;
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('run command without loading the app', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: false,
            commands: ['./FooCommand'],
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
        }));
        await test_helpers_1.fs.add('FooCommand.ts', `
      const { BaseCommand } = require('@adonisjs/ace')
      export default class FooCommand extends BaseCommand {
				public static get settings() {
					return {
						stayAlive: true
					}
				}

        public static get commandName () {
          return 'foo'
        }

        public run () {
          console.log(\`is ready \${this.application.isReady}\`)
        }
      }
    `);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        await ignitor.ace().handle(['generate:manifest']);
        const { output, restore } = test_console_1.stdout.inspect();
        await ignitor.ace().handle(['foo']);
        restore();
        assert.equal(output[0].trim(), 'is ready false');
    });
    (0, japa_1.default)('load app when command setting loadApp is true', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: false,
            commands: ['./FooCommand'],
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
        }));
        await test_helpers_1.fs.add('FooCommand.ts', `
      const { BaseCommand } = require('@adonisjs/ace')
      export default class FooCommand extends BaseCommand {
        static get commandName () {
          return 'foo'
        }

        static get settings () {
          return {
						loadApp: true,
						stayAlive: true
          }
        }

        run () {
          console.log(\`is ready \${this.application.isReady}\`)
        }
      }
    `);
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        await ignitor.ace().handle(['generate:manifest']);
        const { output, restore } = test_console_1.stdout.inspect();
        await ignitor.ace().handle(['foo']);
        restore();
        assert.equal(output[0].trim(), 'is ready true');
    });
    (0, japa_1.default)('print error when command is missing', async (assert) => {
        await (0, test_helpers_1.setupApplicationFiles)();
        /**
         * Overwriting .adonisrc.json
         */
        await test_helpers_1.fs.add('.adonisrc.json', JSON.stringify({
            typescript: false,
            providers: [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')],
        }));
        const ignitor = new Ignitor_1.Ignitor(test_helpers_1.fs.basePath);
        await ignitor.ace().handle(['generate:manifest']);
        const { output, restore } = test_console_1.stderr.inspect();
        await ignitor.ace().handle(['foo']);
        restore();
        assert.match(output[0].trim(), /"foo" command not found/);
    });
});
