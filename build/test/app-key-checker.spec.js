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
const application_1 = require("@adonisjs/application");
const HealthCheck_1 = require("../src/HealthCheck");
const AppKey_1 = __importDefault(require("../src/HealthCheck/Checkers/AppKey"));
japa_1.default.group('Env Health Checker', () => {
    (0, japa_1.default)('fail when APP_KEY is not defined', async (assert) => {
        const application = new application_1.Application(__dirname, 'console', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        (0, AppKey_1.default)(healthCheck);
        const report = await healthCheck.getReport();
        assert.deepEqual(report.report, {
            appKey: {
                displayName: 'App Key Check',
                health: {
                    healthy: false,
                    message: 'Missing APP_KEY environment variable. It is required to keep your application secure',
                },
            },
        });
    });
    (0, japa_1.default)('fail when APP_KEY is not secure', async (assert) => {
        process.env.APP_KEY = '3910200';
        const application = new application_1.Application(__dirname, 'console', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        (0, AppKey_1.default)(healthCheck);
        const report = await healthCheck.getReport();
        assert.deepEqual(report.report, {
            appKey: {
                displayName: 'App Key Check',
                health: {
                    healthy: false,
                    // eslint-disable-next-line max-len
                    message: 'Insecure APP_KEY. It must be 32 characters long. Run "node ace generate:key" to generate a secure key',
                },
            },
        });
        delete process.env.APP_KEY;
    });
    (0, japa_1.default)('work fine when APP_KEY is secure', async (assert) => {
        process.env.APP_KEY = 'asecureandlongrandomsecret';
        const application = new application_1.Application(__dirname, 'console', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        (0, AppKey_1.default)(healthCheck);
        const report = await healthCheck.getReport();
        assert.deepEqual(report.report, {
            appKey: {
                displayName: 'App Key Check',
                health: {
                    healthy: false,
                    // eslint-disable-next-line max-len
                    message: 'Insecure APP_KEY. It must be 32 characters long. Run "node ace generate:key" to generate a secure key',
                },
            },
        });
        delete process.env.APP_KEY;
    });
});
