/**
 * @param {any} value
 * @param {string} publicKey
 * @returns {string}
 */
export function encryptValue(value: any, publicKey: string): string;
/**
 * @param {string} envVar
 * @param {string} value
 * @param {string[]} [privateKeys]
 * @param {boolean} [throwOnDecryptionError=true]
 * @returns {string}
 */
export function decryptValue(envVar: string, value: string, privateKeys?: string[] | undefined, throwOnDecryptionError?: boolean | undefined): string;
/**
 * @param {string} existingPrivateKey
 * @returns {{
 *  publicKey: string
 *  privateKey: string
 * }}
 */
export function keyPair(existingPrivateKey: string): {
    publicKey: string;
    privateKey: string;
};
/**
 * @param {NodeJS.ProcessEnv} processEnv
 * @param {boolean} [doDelete=true] delete private keys from process.env
 * @returns {string[]}
 */
export function getPrivateKeys(processEnv: NodeJS.ProcessEnv, doDelete?: boolean | undefined): string[];
/**
 * @param {Record<string,string>} processEnv
 * @returns {boolean}
 */
export function hasPublicKey(processEnv: Record<string, string>): boolean;
export const DOTENV_PUBLIC_KEY: "DOTENV_PUBLIC_KEY";
