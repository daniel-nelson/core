"use strict";
/*
 * @adonisjs/events
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
const test_helpers_1 = require("../test-helpers");
const HealthCheck_1 = require("../src/HealthCheck");
const HttpExceptionHandler_1 = require("../src/HttpExceptionHandler");
japa_1.default.group('App Provider', (group) => {
    group.afterEach(async () => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
        await test_helpers_1.fs.cleanup();
    });
    (0, japa_1.default)('register app provider', async (assert) => {
        const app = await (0, test_helpers_1.setupApp)([], true);
        assert.isTrue(app.container.hasBinding('Adonis/Core/Env'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Config'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Logger'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Encryption'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Profiler'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Request'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Response'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Server'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/MiddlewareStore'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/HttpContext'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Event'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Hash'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/BodyParser'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/Validator'));
        assert.isTrue(app.container.hasBinding('Adonis/Core/AssetsManager'));
        assert.instanceOf(app.container.use('Adonis/Core/HealthCheck'), HealthCheck_1.HealthCheck);
        assert.deepEqual(app.container.use('Adonis/Core/HttpExceptionHandler'), HttpExceptionHandler_1.HttpExceptionHandler);
        /**
         * Ensure drive routes are registerd
         */
        const router = app.container.use('Adonis/Core/Route');
        router.commit();
        const routes = router.toJSON();
        assert.deepEqual(routes.root[0].name, 'drive.local.serve');
        assert.deepEqual(routes.root[0].pattern, '/uploads/*');
    });
});
