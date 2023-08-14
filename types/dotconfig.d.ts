/** @typedef {import('./dotenv.js').DotenvConfigOptions} DotenvConfigOptions */
/**
 * @param {object} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv|object} [processEnv=process.env] the environment variables
 * @returns {Record<string, any>|{}}
 */
export function getConfig(defaultConfig?: object, processEnv?: NodeJS.ProcessEnv | object): Record<string, any> | {};
/**
 * Generates a function comment for the given function body.
 *
 * @param {object} defaultConfig the default configuration
 * @param {DotenvConfigOptions} [options] - the options for the function
 * @returns {Record<string, any>|{}} the result from getConfig()
 */
export function dotconfig(defaultConfig: object, options?: dotenv.DotenvConfigOptions | undefined): Record<string, any> | {};
export type DotenvConfigOptions = import('./dotenv.js').DotenvConfigOptions;
import * as dotenv from './dotenv.js';
