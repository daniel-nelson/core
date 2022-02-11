"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ignitor = void 0;
/*
 * @adonisjs/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const path_1 = require("path");
const url_1 = require("url");
const application_1 = require("@adonisjs/application");
const Ace_1 = require("./Ace");
const HttpServer_1 = require("./HttpServer");
/**
 * Ignitor is used to wireup different pieces of AdonisJs to bootstrap
 * the application.
 */
class Ignitor {
    constructor(appRoot) {
        // In ESM, ignitor is constructed with `import.meta.url`. Normalize the file URL to an absolute directory path.
        this.appRoot = appRoot.startsWith('file:') ? (0, path_1.dirname)((0, url_1.fileURLToPath)(appRoot)) : appRoot;
    }
    /**
     * Returns an instance of the application.
     */
    application(environment) {
        return new application_1.Application(this.appRoot, environment);
    }
    /**
     * Returns instance of server to start
     * the HTTP server
     */
    httpServer() {
        return new HttpServer_1.HttpServer(this.appRoot);
    }
    /**
     * Returns instance of ace to handle console
     * commands
     */
    ace() {
        return new Ace_1.Ace(this.appRoot);
    }
}
exports.Ignitor = Ignitor;
