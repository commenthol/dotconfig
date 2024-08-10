import assert from 'node:assert/strict'
import { parse } from '../src/dotenv.js'

const content =
  '# Comment\n' +
  'export KEY=value\n' +
  '\n' +
  'KEY_QUOTES_DOUBLE="value in double quotes"\n' +
  "KEY_QUOTES_SINGLE='value in single quotes'\n" +
  'KEY_BACKTICKS=`value in backticks`\n' +
  '\n' +
  'KEY_QUOTES_DOUBLE_COMMENT="value in \'double\' quotes `and` a line comment" # with a comment\n' +
  'KEY_QUOTES_SINGLE_COMMENT=\'value in "single" quotes `and` a line comment\' # with a comment\n' +
  'KEY_BACKTICKS_COMMENT=`value in \'backticks\' "and" a line comment` # with a comment\n' +
  '\n' +
  'KEY_QUOTES_DOUBLE_MULTILINE="value\n' +
  '  ov\\"er \\"\n' +
  "  'some' # this is not a comment\n" +
  '  lines" # but this is a comment \n' +
  "KEY_QUOTES_SINGLE_MULTILINE='value\n" +
  "  ov\\'er \\'\n" +
  '  "some" # this is not a comment\n' +
  "  lines' # but this is a comment \n" +
  'KEY_BACKTICKS_MULTILINE=`value\n' +
  '  ov\\`er \\`\n' +
  '  "some" # this is not a comment\n' +
  '  lines` # but this is a comment\n'

const expected = [
  { line: '# Comment' },
  { line: 'export KEY=value', key: 'KEY', value: 'value' },
  { line: '' },
  {
    line: 'KEY_QUOTES_DOUBLE="value in double quotes"',
    key: 'KEY_QUOTES_DOUBLE',
    value: 'value in double quotes',
    comment: '',
    quoteChar: '"'
  },
  {
    line: "KEY_QUOTES_SINGLE='value in single quotes'",
    key: 'KEY_QUOTES_SINGLE',
    value: 'value in single quotes',
    comment: '',
    quoteChar: "'"
  },
  {
    line: 'KEY_BACKTICKS=`value in backticks`',
    key: 'KEY_BACKTICKS',
    value: 'value in backticks',
    comment: '',
    quoteChar: '`'
  },
  { line: '' },
  {
    line: 'KEY_QUOTES_DOUBLE_COMMENT="value in \'double\' quotes `and` a line comment" # with a comment',
    key: 'KEY_QUOTES_DOUBLE_COMMENT',
    value: "value in 'double' quotes `and` a line comment",
    comment: ' # with a comment',
    quoteChar: '"'
  },
  {
    line: 'KEY_QUOTES_SINGLE_COMMENT=\'value in "single" quotes `and` a line comment\' # with a comment',
    key: 'KEY_QUOTES_SINGLE_COMMENT',
    value: 'value in "single" quotes `and` a line comment',
    comment: ' # with a comment',
    quoteChar: "'"
  },
  {
    line: 'KEY_BACKTICKS_COMMENT=`value in \'backticks\' "and" a line comment` # with a comment',
    key: 'KEY_BACKTICKS_COMMENT',
    value: 'value in \'backticks\' "and" a line comment',
    comment: ' # with a comment',
    quoteChar: '`'
  },
  { line: '' },
  {
    line: 'KEY_QUOTES_DOUBLE_MULTILINE="value\n  ov\\"er \\"\n  \'some\' # this is not a comment\n  lines" # but this is a comment ',
    key: 'KEY_QUOTES_DOUBLE_MULTILINE',
    value: 'value\n  ov"er "\n  \'some\' # this is not a comment\n  lines',
    comment: ' # but this is a comment ',
    quoteChar: '"'
  },
  {
    line: "KEY_QUOTES_SINGLE_MULTILINE='value\n  ov\\'er \\'\n  \"some\" # this is not a comment\n  lines' # but this is a comment ",
    key: 'KEY_QUOTES_SINGLE_MULTILINE',
    value: 'value\n  ov\'er \'\n  "some" # this is not a comment\n  lines',
    comment: ' # but this is a comment ',
    quoteChar: "'"
  },
  {
    line: 'KEY_BACKTICKS_MULTILINE=`value\n  ov\\`er \\`\n  "some" # this is not a comment\n  lines` # but this is a comment',
    key: 'KEY_BACKTICKS_MULTILINE',
    value: 'value\n  ov`er `\n  "some" # this is not a comment\n  lines',
    comment: ' # but this is a comment',
    quoteChar: '`'
  },
  { line: '' }
]

describe('dotenv.parse()', function () {
  it('shall parse into tokens', function () {
    const { tokens } = parse(content)
    // console.debug(JSON.stringify(tokens))
    assert.deepEqual(JSON.parse(JSON.stringify(tokens)), expected)
  })
})
