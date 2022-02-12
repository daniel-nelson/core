"use strict";
/*
 * @adonisjs/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineReplBindings = void 0;
/**
 * Shortcuts to load containers bindings
 */
function setupReplState(repl, key, value) {
    repl.server.context[key] = value;
    repl.notify(`Loaded ${key} module. You can access it using the "${repl.colors.underline(key)}" variable`);
}
/**
 * Define repl bindings. The method must be invoked when application environment
 * is set to repl.
 */
function defineReplBindings(application, Repl) {
    /**
     * Load the encryption module
     */
    Repl.addMethod('loadEncryption', (repl) => {
        setupReplState(repl, 'Encryption', application.container.resolveBinding('Adonis/Core/Encryption'));
    }, {
        description: 'Load encryption provider and save reference to the "Encryption" variable',
    });
    /**
     * Load the hash module
     */
    Repl.addMethod('loadHash', (repl) => {
        setupReplState(repl, 'Hash', application.container.resolveBinding('Adonis/Core/Hash'));
    }, {
        description: 'Load hash provider and save reference to the "Hash" variable',
    });
    /**
     * Load the Env module
     */
    Repl.addMethod('loadEnv', (repl) => {
        setupReplState(repl, 'Env', application.container.resolveBinding('Adonis/Core/Env'));
    }, {
        description: 'Load env provider and save reference to the "Env" variable',
    });
    /**
     * Load the HTTP router
     */
    Repl.addMethod('loadRouter', (repl) => {
        setupReplState(repl, 'Route', application.container.resolveBinding('Adonis/Core/Route'));
    }, {
        description: 'Load router and save reference to the "Route" variable',
    });
    /**
     * Load config
     */
    Repl.addMethod('loadConfig', (repl) => {
        setupReplState(repl, 'Config', application.container.resolveBinding('Adonis/Core/Config'));
    }, {
        description: 'Load config and save reference to the "Config" variable',
    });
    /**
     * Load validator
     */
    Repl.addMethod('loadValidator', (repl) => {
        setupReplState(repl, 'Validator', application.container.resolveBinding('Adonis/Core/Validator'));
    }, {
        description: 'Load validator and save reference to the "Validator" variable',
    });
    /**
     * Create context for a dummy route
     */
    Repl.addMethod('getContext', (_, route, params) => {
        return application.container.use('Adonis/Core/HttpContext').create(route, params || {});
    }, {
        description: 'Get HTTP context for a given route',
        usage: `${Repl.colors.yellow('getContext')}${Repl.colors.gray('(route, params?)')}`,
    });
    /**
     * Load the Helpers module
     */
    Repl.addMethod('loadHelpers', (repl) => {
        setupReplState(repl, 'Helpers', application.container.resolveBinding('Adonis/Core/Helpers'));
    }, {
        description: 'Load helpers provider and save reference to the "Helpers" variable',
    });
}
exports.defineReplBindings = defineReplBindings;
