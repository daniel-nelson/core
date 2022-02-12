"use strict";
/*
 * @adonisjs/ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBodyParserMiddleware = exports.setupApp = exports.setupApplicationFiles = exports.fs = void 0;
const path_1 = require("path");
const dev_utils_1 = require("@poppinss/dev-utils");
const application_1 = require("@adonisjs/application");
const SECRET = 'asecureandlongrandomsecret';
exports.fs = new dev_utils_1.Filesystem((0, path_1.join)(__dirname, '__app'));
/**
 * Setup application files for testing
 */
async function setupApplicationFiles(additionalProviders, serveFiles = false) {
    await exports.fs.fsExtra.ensureDir((0, path_1.join)(exports.fs.basePath, 'config'));
    const providers = Array.isArray(additionalProviders)
        ? additionalProviders.concat((0, path_1.join)(__dirname, '../providers/AppProvider.ts'))
        : [(0, path_1.join)(__dirname, '../providers/AppProvider.ts')];
    await exports.fs.add('.adonisrc.json', JSON.stringify({
        autoloads: {
            App: './app',
        },
        providers: providers,
    }));
    await exports.fs.add('app/Exceptions/Handler.ts', `
  export default class ExceptionHandler {
  }`);
    await exports.fs.add('config/app.ts', `
    export const appKey = '${SECRET}'
    export const http = {
      trustProxy () {
        return true
      },
      cookie: {}
    }
    export const logger = {
      enabled: true,
      name: 'adonisjs',
      level: 'info',
    }
  `);
    await exports.fs.add('config/drive.ts', `
    const driveConfig = {
      disk: 'local',
      disks: {
        local: {
          driver: 'local',
          serveFiles: ${serveFiles},
          basePath: '/uploads',
          root: '${exports.fs.basePath}'
        }
      }
    }

    export default driveConfig
  `);
    await exports.fs.add('.env', `APP_KEY = ${SECRET}`);
}
exports.setupApplicationFiles = setupApplicationFiles;
/**
 * Setup application for testing
 */
async function setupApp(additionalProviders, serveAssets = false) {
    await setupApplicationFiles(additionalProviders, serveAssets);
    const app = new application_1.Application(exports.fs.basePath, 'web');
    await app.setup();
    await app.registerProviders();
    await app.bootProviders();
    return app;
}
exports.setupApp = setupApp;
async function registerBodyParserMiddleware(app) {
    app.container.use('Adonis/Core/Server').middleware.clear();
    app.container.use('Adonis/Core/Server').middleware.register([
        async () => {
            return {
                default: app.container.use('Adonis/Core/BodyParser'),
            };
        },
    ]);
    app.container.use('Adonis/Core/Config').set('bodyparser', {
        whitelistedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
        json: {
            types: [],
        },
        form: {
            types: [],
        },
        raw: {
            types: [],
        },
        multipart: {
            processManually: [],
            autoProcess: true,
            types: ['multipart/form-data'],
        },
    });
}
exports.registerBodyParserMiddleware = registerBodyParserMiddleware;
