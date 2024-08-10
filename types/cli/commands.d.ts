export namespace commands {
    /**
     * @param {Args} flags
     */
    function prepare(flags: Args): import("../dotenv.js").ConfigResult & {
        parsed: {
            DOTENV_PRIVATE_KEYS_PATH?: string;
        };
    };
    /**
     * @param {ConfigResult} conf
     * @param {Args} flags
     */
    function decrypt(conf: ConfigResult, flags: Args): void;
    /**
     * @param {ConfigResult} conf
     * @param {Args} flags
     */
    function encrypt(conf: ConfigResult, flags: Args): void;
    /**
     * @param {Args} flags
     */
    function publickey(flags: Args): void;
}
export function decryptValues(parsed?: Record<string, string> | {}, privateKeys?: string[]): Record<string, string> | {};
export function printDotFile(tokens?: Token[], records?: Record<string, string> | {}): string;
export function quoteAndEscValue(quoteChar: string | undefined, value: string): string;
export function postfixFromFilename(file: string): string;
export function createNewKeys(param: {
    file: string;
    privateKey: string;
    tokens: Token[];
    tokensKeys: Token[];
}): {
    publicKey: string;
    tokens: Token[];
    tokensKeys: Token[];
};
export function updateKeys(publicKey: any, tokens?: Token[], records?: Record<string, string> | {}): void;
export type ConfigResult = import("../dotenv.js").ConfigResult;
export type Token = import("../dotenv.js").Token;
export type Args = import("./index.js").Args;
