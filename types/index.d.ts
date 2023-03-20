/**
 * @param {Record<string, any>|{}} [defaultConfig] default configuration
 * @param {NodeJS.ProcessEnv} [env=process.env] the environment variables
 * @returns {Record<string, any>|{}}
 */
export function getConfig(defaultConfig?: {} | Record<string, any> | undefined, env?: NodeJS.ProcessEnv | undefined): Record<string, any> | {};
