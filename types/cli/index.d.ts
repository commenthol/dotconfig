export { log };
export function cli(): void;
export type Args = {
    command?: string;
    args: string[] | [];
    help?: boolean;
    version?: boolean;
    quiet?: boolean;
    file: string;
    keys: string;
    encoding: BufferEncoding;
    stdout?: boolean;
};
import { log } from '../utils.js';
