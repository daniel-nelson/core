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
exports.HttpServer = void 0;
const application_1 = require("@adonisjs/application");
const http_1 = require("http");
const ErrorHandler_1 = require("./ErrorHandler");
const SignalsListener_1 = require("../SignalsListener");
/**
 * Exposes the API to setup the application for starting the HTTP
 * server.
 */
class HttpServer {
    constructor(appRoot) {
        this.appRoot = appRoot;
        /**
         * Whether or not the application has been wired.
         */
        this.wired = false;
        /**
         * Reference to the application.
         */
        this.application = new application_1.Application(this.appRoot, 'web');
        /**
         * Listens for unix signals to kill long running
         * processes.
         */
        this.signalsListener = new SignalsListener_1.SignalsListener(this.application);
    }
    /**
     * Wires up everything, so that we are ready to kick start
     * the HTTP server.
     */
    async wire() {
        if (this.wired) {
            return;
        }
        /**
         * Setting up the application.
         */
        await this.application.setup();
        /**
         * Registering providers
         */
        await this.application.registerProviders();
        /**
         * Booting providers
         */
        await this.application.bootProviders();
        /**
         * Importing preloaded files
         */
        await this.application.requirePreloads();
    }
    /**
     * Sets the server reference
     */
    setServer() {
        this.server = this.application.container.use('Adonis/Core/Server');
    }
    /**
     * Closes the underlying HTTP server
     */
    closeHttpServer() {
        return new Promise((resolve) => this.server.instance.close(() => resolve()));
    }
    /**
     * Monitors the HTTP server for close and error events, so that
     * we can perform a graceful shutdown
     */
    monitorHttpServer() {
        this.server.instance.on('close', async () => {
            this.application.logger.trace('closing http server');
            this.server.instance.removeAllListeners();
            this.application.isShuttingDown = true;
        });
        this.server.instance.on('error', async (error) => {
            if (error.code === 'EADDRINUSE') {
                this.application.logger.error('Port in use, closing server');
                process.exitCode = 1;
                return;
            }
            else {
                this.application.logger.error(error.code || '');
                this.application.logger.error(JSON.stringify(error));
                process.exitCode = 1;
                return;
            }
            // await this.kill(3000)
        });
    }
    /**
     * Notify server is ready
     */
    notifyServerReady(host, port) {
        this.application.logger.info('started server on %s:%s', host, port);
        if (process.send) {
            process.send({ origin: 'adonis-http-server', ready: true, port: port, host: host });
        }
    }
    /**
     * Creates the HTTP server to handle incoming requests. The server is just
     * created but not listening on any port.
     */
    createServer(serverCallback) {
        /**
         * Optimizing the server by pre-compiling routes and middleware
         */
        this.application.logger.trace('optimizing http server handler');
        this.server.optimize();
        /**
         * Bind exception handler to handle exceptions occured during HTTP requests.
         */
        if (this.application.exceptionHandlerNamespace) {
            this.application.logger.trace('binding %s exception handler', this.application.exceptionHandlerNamespace);
            this.server.errorHandler(this.application.exceptionHandlerNamespace);
        }
        const handler = this.server.handle.bind(this.server);
        this.server.instance = serverCallback ? serverCallback(handler) : (0, http_1.createServer)(handler);
    }
    /**
     * Starts the http server a given host and port
     */
    listen() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.application.start();
                const host = this.application.env.get('HOST', '0.0.0.0');
                const port = Number(this.application.env.get('PORT', '3333'));
                this.server.instance.listen(port, host, () => {
                    this.notifyServerReady(host, port);
                    resolve();
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Start the HTTP server by wiring up the application
     */
    async start(serverCallback) {
        try {
            await this.wire();
            this.setServer();
            this.createServer(serverCallback);
            this.monitorHttpServer();
            await this.listen();
            this.signalsListener.listen(() => this.close());
        }
        catch (error) {
            await new ErrorHandler_1.ErrorHandler(this.application).handleError(error);
        }
    }
    /**
     * Prepares the application for shutdown. This method will invoke `shutdown`
     * lifecycle method on the providers and closes the `httpServer`.
     */
    async close() {
        /**
         * Close the HTTP server before excuting the `shutdown` hooks. This ensures that
         * we are not accepting any new request during cool off.
         */
        await this.closeHttpServer();
        this.signalsListener.cleanup();
        await this.application.shutdown();
    }
    /**
     * Kills the http server process by attempting to perform a graceful
     * shutdown or killing the app forcefully as waiting for configured
     * seconds.
     */
    async kill(waitTimeout = 3000) {
        this.application.logger.trace('forcefully killing http server');
        try {
            await Promise.race([
                this.close(),
                new Promise((resolve) => {
                    setTimeout(resolve, waitTimeout);
                }),
            ]);
            process.exit(0);
        }
        catch (error) {
            new ErrorHandler_1.ErrorHandler(this.application).handleError(error).finally(() => process.exit(1));
        }
    }
}
exports.HttpServer = HttpServer;
