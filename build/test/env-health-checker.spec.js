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
const Env_1 = __importDefault(require("../src/HealthCheck/Checkers/Env"));
japa_1.default.group('Env Health Checker', () => {
    (0, japa_1.default)('fail when NODE_ENV is not defined', async (assert) => {
        const application = new application_1.Application(__dirname, 'console', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        (0, Env_1.default)(healthCheck);
        const report = await healthCheck.getReport();
        assert.deepEqual(report.report, {
            env: {
                displayName: 'Node Env Check',
                health: {
                    healthy: false,
                    message: 'Missing NODE_ENV environment variable. It can make some parts of the application misbehave',
                },
            },
        });
    });
    (0, japa_1.default)('work fine when NODE_ENV is defined', async (assert) => {
        process.env.NODE_ENV = 'development';
        const application = new application_1.Application(__dirname, 'console', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        (0, Env_1.default)(healthCheck);
        const report = await healthCheck.getReport();
        assert.deepEqual(report.report, {
            env: {
                displayName: 'Node Env Check',
                health: {
                    healthy: true,
                },
            },
        });
        delete process.env.NODE_ENV;
    });
});
