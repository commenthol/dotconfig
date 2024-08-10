/**
 * @param {object} [opts]
 * @param {string[]} [opts.command] commands
 * @param {Record<string, any>} [opts.def] default cmd object
 * @param {Record<string, string>} [opts.shortCode] shortcodes by cmd key e.g. {'-h': 'help'}
 * @param {Record<string, StringConstructor|BooleanConstructor|NumberConstructor|string>} [opts.types] required type for arg e.g. {'port': Number}
 * @param {string[]} [args] CLI arguments
 * @returns {{
 *  args: string[]|[]
 * } | Record<string, string|boolean|number>}
 * @example
 * ```js
 * const help = `
 *   usage:
 *     prg [options] args
 *
 *   options:
 *     -h,--help             this help
 *     -p,--port <port>      use different port
 *     -t,--task <string>    define task
 * `
 * const cmd = argv({
 *   shortCode: { '-p': 'port', '-h': 'help', '-t': 'to' },
 *   types: { port: Number, to: String }, // define switch types
 *   def: { port: 1234 }, // defaults
 * })
 * if (cmd.help) {
 *   console.log(help)
 *   process.exit()
 * }
 * ```
 */
export function argv(opts?: {
    command?: string[] | undefined;
    def?: Record<string, any> | undefined;
    shortCode?: Record<string, string> | undefined;
    types?: Record<string, string | NumberConstructor | StringConstructor | BooleanConstructor> | undefined;
} | undefined, args?: string[] | undefined): {
    args: string[] | [];
} | Record<string, string | boolean | number>;
