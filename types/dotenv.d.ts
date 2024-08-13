/**
 * @typedef {object} DotenvConfigOptions
 * @property {string|URL} [options.path] The path to the dotenv file. Default is '.env' in the current working directory. May be set via DOTENV_CONFIG_PATH env var.
 * @property {BufferEncoding} [options.encoding='utf-8'] The encoding of the dotenv file. May be set via DOTENV_CONFIG_ENCODING env var.
 * @property {boolean} [options.override=false] Whether to override existing process environment variables. Default is false. May be set by DOTENV_CONFIG_OVERRIDE env var.
 * @property {NodeJS.ProcessEnv|object} [options.processEnv] The process environment object to update. Default is `process.env`.
 */
/**
 * @typedef {{
 *  parsed: Record<string,string|number|boolean>|{}
 *  privateKeys?: string[]
 *  tokens?: Token[]
 *  tokensKeys?: Token[]
 * }} ConfigResult
 * - parsed: key-value pairs of parsed .env file
 * - privateKeys: list of private keys found in keys file
 * - tokens: (used by cli) tokenized lines of .env file
 * - tokensKeys: (used by cli) tokenized lines of .env.keys file
 */
/**
 * Reads and parses a dotenv file and updates the process environment variables.
 *
 * @param {DotenvConfigOptions} [options] Optional parameters for configuring the dotenv file.
 * @return {ConfigResult} An object containing the parsed dotenv file data.
 */
export function config(options?: DotenvConfigOptions | undefined): ConfigResult;
/**
 * @param {string} path
 * @param {{ encoding?: BufferEncoding }} [options]
 * @returns {{env?: Record<string,string>, tokens?: Token[]}}
 */
export function parseDotenvFile(path: string, options?: {
    encoding?: BufferEncoding;
} | undefined): {
    env?: Record<string, string>;
    tokens?: Token[];
};
/**
 * @typedef {{
 *  line?: string
 *  key?: string
 *  value?: string
 *  quoteChar?: string
 *  comment?: string
 * }} Token
 * - line: original or concated line(s)
 * - key: found key on that line (or multiline)
 * - value: value of key
 * - quoteChar: quote character of value
 * - comment: comment on same line as key-value
 */
/**
 * Parses the content and extracts key-value pairs into an object.
 *
 * @param {string} content The content to parse.
 * @return {{
 *  env: Record<string,string>|{}
 *  tokens: Token[]
 * }} An object containing the extracted key-value pairs.
 */
export function parse(content: string): {
    env: Record<string, string> | {};
    tokens: Token[];
};
export const DOTENV_PRIVATE_KEYS_PATH: "DOTENV_PRIVATE_KEYS_PATH";
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
/**
 * - parsed: key-value pairs of parsed .env file
 * - privateKeys: list of private keys found in keys file
 * - tokens: (used by cli) tokenized lines of .env file
 * - tokensKeys: (used by cli) tokenized lines of .env.keys file
 */
export type ConfigResult = {
    parsed: Record<string, string | number | boolean> | {};
    privateKeys?: string[];
    tokens?: Token[];
    tokensKeys?: Token[];
};
/**
 * - line: original or concated line(s)
 * - key: found key on that line (or multiline)
 * - value: value of key
 * - quoteChar: quote character of value
 * - comment: comment on same line as key-value
 */
export type Token = {
    line?: string;
    key?: string;
    value?: string;
    quoteChar?: string;
    comment?: string;
};
