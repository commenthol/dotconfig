/** @typedef {import('./dotenv.js').DotenvConfigOptions} DotenvConfigOptions */
/**
 * @typedef {object} DotConfigOptionsExtra
 * @property {boolean} [additionalProps=true] if `false` do not add additional props on top-level not part of defaultConfig
 * @property {boolean} [additionalPropsAll=true] if `false` do not add any additional props that are not part of defaultConfig
 */
/** @typedef {DotenvConfigOptions & DotConfigOptionsExtra} DotConfigOptions */
/**
 * @param {object} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv|object} [processEnv=process.env] the environment variables
 * @param {DotConfigOptionsExtra} [options]
 * @returns {Record<string, any>|{}}
 */
export function getConfig(defaultConfig?: object, processEnv?: NodeJS.ProcessEnv | object, options?: DotConfigOptionsExtra | undefined): Record<string, any> | {};
/**
 * Generates a function comment for the given function body.
 *
 * @param {object} defaultConfig the default configuration
 * @param {DotConfigOptions} [options] - the options for the function
 * @returns {Record<string, any>|{}} the result from getConfig()
 */
export function dotconfig(defaultConfig: object, options?: DotConfigOptions | undefined): Record<string, any> | {};
export type DotenvConfigOptions = import("./dotenv.js").DotenvConfigOptions;
export type DotConfigOptionsExtra = {
    /**
     * if `false` do not add additional props on top-level not part of defaultConfig
     */
    additionalProps?: boolean | undefined;
    /**
     * if `false` do not add any additional props that are not part of defaultConfig
     */
    additionalPropsAll?: boolean | undefined;
};
export type DotConfigOptions = DotenvConfigOptions & DotConfigOptionsExtra;
