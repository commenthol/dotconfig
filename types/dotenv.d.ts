/**
 * @typedef {object} DotenvConfigOptions
 * @property {string|URL} [options.path] The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
 * @property {BufferEncoding} [options.encoding='utf-8'] The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
 * @property {boolean} [options.override=false] Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
 * @property {NodeJS.ProcessEnv|object} [options.processEnv] The process environment object to update. Default is `process.env`.
 */
/**
 * Reads and parses a dotenv file and updates the process environment variables.
 *
 * @param {DotenvConfigOptions} [options] Optional parameters for configuring the dotenv file.
 * @return {object|undefined} An object containing the parsed dotenv file data.
 */
export function config(options?: DotenvConfigOptions | undefined): object | undefined;
/**
 * Parses the content and extracts key-value pairs into an object.
 *
 * @param {string} content The content to parse.
 * @return {object} An object containing the extracted key-value pairs.
 */
export function parse(content: string): object;
export type DotenvConfigOptions = {
    /**
     * The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
     */
    path?: string | URL | undefined;
    /**
     * The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
     */
    encoding?: BufferEncoding | undefined;
    /**
     * Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
     */
    override?: boolean | undefined;
    /**
     * The process environment object to update. Default is `process.env`.
     */
    processEnv?: NodeJS.ProcessEnv | object;
};
