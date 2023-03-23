/**
 * @param {object} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv} [env=process.env] the environment variables
 * @returns {Record<string, any>|{}}
 */
export function getConfig(defaultConfig?: object, env?: NodeJS.ProcessEnv | undefined): Record<string, any> | {};
