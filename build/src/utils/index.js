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
exports.registerTsHook = exports.isMissingModuleError = void 0;
const helpers_1 = require("@poppinss/utils/build/helpers");
/**
 * Helper to know if error belongs to a missing module
 * error
 */
function isMissingModuleError(error) {
    return ['MODULE_NOT_FOUND', 'ENOENT'].includes(error.code);
}
exports.isMissingModuleError = isMissingModuleError;
/**
 * Registers the ts hook to compile typescript code within the memory
 */
function registerTsHook(appRoot) {
    try {
        require((0, helpers_1.resolveFrom)(appRoot, '@adonisjs/assembler/build/src/requireHook')).default(appRoot);
    }
    catch (error) {
        if (isMissingModuleError(error)) {
            throw new Error('AdonisJS requires "@adonisjs/assembler" in order to run typescript source directly');
        }
        throw error;
    }
}
exports.registerTsHook = registerTsHook;
