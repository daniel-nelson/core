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
exports.AssetsManager = void 0;
const utils_1 = require("@poppinss/utils");
const stringify_attributes_1 = __importDefault(require("stringify-attributes"));
const Encore_1 = require("./Drivers/Encore");
/**
 * Assets manager exposes the API to make link and HTML fragments
 * for static assets.
 *
 * The compilation is not done by the assets manager. It must be done
 * separately
 */
class AssetsManager {
    constructor(config, application) {
        this.config = config;
        this.application = application;
        this.drivers = {
            encore: () => new Encore_1.EncoreDriver(this.application),
        };
        this.booted = false;
    }
    /**
     * Find if the configured driver supports entrypoints or not
     */
    get hasEntrypoints() {
        this.boot();
        return this.driver.hasEntrypoints;
    }
    /**
     * Path to the public output directory. The property must be
     * mutable
     */
    get publicPath() {
        this.boot();
        return this.driver.publicPath;
    }
    /**
     * Returns the current version of assets
     */
    get version() {
        this.boot();
        return this.driver.version;
    }
    /**
     * Returns the name of the driver currently in use
     */
    get name() {
        this.boot();
        return this.driver.name;
    }
    /**
     * Boot the manager. Must be done lazily to allow `extend` method to takes
     * in effect.
     */
    boot() {
        if (this.booted) {
            return false;
        }
        this.booted = true;
        const driver = this.config.driver || 'encore';
        /**
         * Ensure driver name is recognized
         */
        if (!this.drivers[driver]) {
            throw new utils_1.Exception(`Invalid asset driver "${driver}". Make sure to register the driver using the "AssetsManager.extend" method`);
        }
        /**
         * Configure the driver
         */
        this.driver = this.drivers[driver](this, this.config);
        /**
         * Configure the public path
         */
        if (this.config.publicPath) {
            this.driver.publicPath = this.config.publicPath;
        }
    }
    /**
     * Ensure entrypoints are enabled, otherwise raise an exception. The
     * methods relying on the entrypoints file uses this method
     */
    ensureHasEntryPoints() {
        if (!this.hasEntrypoints) {
            throw new Error(`Cannot reference entrypoints. The "${this.driver.name}" driver does not support entrypoints`);
        }
    }
    /**
     * Returns the manifest contents as an object
     */
    manifest() {
        this.boot();
        return this.driver.manifest();
    }
    /**
     * Returns path to a given asset entry
     */
    assetPath(filename) {
        this.boot();
        return this.driver.assetPath(filename);
    }
    /**
     * Returns the entrypoints contents as an object
     */
    entryPoints() {
        this.boot();
        this.ensureHasEntryPoints();
        return this.driver.entryPoints();
    }
    /**
     * Returns list for all the javascript files for a given entry point.
     * Raises exceptions when [[hasEntrypoints]] is false
     */
    entryPointJsFiles(name) {
        this.boot();
        this.ensureHasEntryPoints();
        return this.driver.entryPointJsFiles(name);
    }
    /**
     * Returns list for all the css files for a given entry point.
     * Raises exceptions when [[hasEntrypoints]] is false
     */
    entryPointCssFiles(name) {
        this.boot();
        this.ensureHasEntryPoints();
        return this.driver.entryPointCssFiles(name);
    }
    /**
     * Returns an HTML fragment for script tags. Raises exceptions
     * when [[hasEntrypoints]] is false
     */
    entryPointScriptTags(name) {
        const scripts = this.entryPointJsFiles(name);
        const scriptAttributes = this.config.script ? this.config.script.attributes || {} : {};
        return scripts
            .map((url) => `<script src="${url}"${(0, stringify_attributes_1.default)(scriptAttributes)}></script>`)
            .join('\n');
    }
    /**
     * Returns an HTML fragment for stylesheet link tags. Raises exceptions
     * when [[hasEntrypoints]] is false
     */
    entryPointStyleTags(name) {
        const links = this.entryPointCssFiles(name);
        const styleAttributes = this.config.style ? this.config.style.attributes || {} : {};
        return links
            .map((url) => `<link rel="stylesheet" href="${url}"${(0, stringify_attributes_1.default)(styleAttributes)} />`)
            .join('\n');
    }
    /**
     * Register a custom asset manager driver
     */
    extend(name, callback) {
        this.drivers[name] = callback;
        return this;
    }
}
exports.AssetsManager = AssetsManager;
