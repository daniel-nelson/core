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
const application_1 = require("@adonisjs/application");
const HealthCheck_1 = require("../src/HealthCheck");
japa_1.default.group('HealthCheck', () => {
    (0, japa_1.default)('use application isReady state to find if application is ready', (assert) => {
        const application = new application_1.Application(__dirname, 'web', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        assert.isFalse(healthCheck.isReady());
        application.state = 'ready';
        assert.isTrue(healthCheck.isReady());
        application.isShuttingDown = true;
        assert.isFalse(healthCheck.isReady());
    });
    (0, japa_1.default)('get health checks report', async (assert) => {
        const application = new application_1.Application(__dirname, 'web', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        healthCheck.addChecker('event-loop', async () => {
            return {
                displayName: 'event loop',
                health: {
                    healthy: true,
                },
            };
        });
        const report = await healthCheck.getReport();
        assert.deepEqual(report, {
            healthy: true,
            report: {
                'event-loop': {
                    displayName: 'event loop',
                    health: {
                        healthy: true,
                    },
                },
            },
        });
    });
    (0, japa_1.default)('handle exceptions raised within the checker', async (assert) => {
        const application = new application_1.Application(__dirname, 'web', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        healthCheck.addChecker('event-loop', async () => {
            throw new Error('boom');
        });
        const report = await healthCheck.getReport();
        assert.deepEqual(report, {
            healthy: false,
            report: {
                'event-loop': {
                    displayName: 'event-loop',
                    health: {
                        healthy: false,
                        message: 'boom',
                    },
                    meta: {
                        fatal: true,
                    },
                },
            },
        });
    });
    (0, japa_1.default)('set healthy to false when any of the checker fails', async (assert) => {
        const application = new application_1.Application(__dirname, 'web', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        healthCheck.addChecker('database', async () => {
            return {
                displayName: 'database',
                health: {
                    healthy: true,
                },
            };
        });
        healthCheck.addChecker('event-loop', async () => {
            throw new Error('boom');
        });
        const report = await healthCheck.getReport();
        assert.deepEqual(report, {
            healthy: false,
            report: {
                'event-loop': {
                    displayName: 'event-loop',
                    health: {
                        healthy: false,
                        message: 'boom',
                    },
                    meta: {
                        fatal: true,
                    },
                },
                'database': {
                    displayName: 'database',
                    health: {
                        healthy: true,
                    },
                },
            },
        });
    });
    (0, japa_1.default)('define checker as IoC container binding', async (assert) => {
        const application = new application_1.Application(__dirname, 'web', {});
        const healthCheck = new HealthCheck_1.HealthCheck(application);
        class DbChecker {
            async report() {
                return {
                    health: {
                        healthy: true,
                    },
                };
            }
        }
        application.container.bind('App/Checkers/Db', () => {
            return new DbChecker();
        });
        healthCheck.addChecker('database', 'App/Checkers/Db');
        const report = await healthCheck.getReport();
        assert.deepEqual(report, {
            healthy: true,
            report: {
                database: {
                    displayName: 'database',
                    health: {
                        healthy: true,
                    },
                },
            },
        });
    });
});
