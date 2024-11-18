import assert from 'node:assert/strict'
import fs from 'fs'
import { parse } from '../src/dotenv.js'

const load = async (filename) => {
  const content = fs.readFileSync(new URL(filename, import.meta.url), 'utf-8')
  const { expected } = await import(filename + '.js')
  return { content, expected }
}

const writeFixture = (filename, actual) => {
  if (process.env.WRITE_FIXTURES === 'true') {
    fs.writeFileSync(
      new URL(filename + '.js', import.meta.url),
      'export const expected = ' + JSON.stringify(actual, null, 2),
      'utf-8'
    )
  }
}

const testCase = async (filename) => {
  const { content, expected } = await load(filename)
  const { tokens } = parse(content)
  writeFixture(filename, tokens)
  assert.deepEqual(JSON.parse(JSON.stringify(tokens)), expected)
}

describe('dotenv.parse()', function () {
  it('issue backslash without quote', function () {
    const { tokens } = parse('A="a\\nb"\n')
    assert.deepEqual(tokens, [
      {
        line: 'A="a\\nb"',
        key: 'A',
        value: 'a\\nb',
        comment: '',
        quoteChar: '"'
      },
      { line: '' }
    ])
  })

  it('issue multiline', function () {
    const { tokens } = parse('A="a\nb\n"\n')
    assert.deepEqual(tokens, [
      {
        line: 'A="a\nb\n"',
        key: 'A',
        value: 'a\nb\n',
        comment: '',
        quoteChar: '"'
      },
      { line: '' }
    ])
  })

  it('multiline export', function () {
    const { tokens } = parse('export A="a\nexport b\n"\n')
    assert.deepEqual(tokens, [
      {
        line: 'export A="a\nexport b\n"',
        key: 'A',
        value: 'a\nexport b\n',
        comment: '',
        quoteChar: '"'
      },
      { line: '' }
    ])
  })

  it('issue key value splitting', function () {
    const { tokens } = parse('export A="a=b=c"\n')
    assert.deepEqual(tokens, [
      {
        line: 'export A="a=b=c"',
        key: 'A',
        value: 'a=b=c',
        comment: '',
        quoteChar: '"'
      },
      { line: '' }
    ])
  })

  it('value with unterminated quote', function () {
    const { tokens } = parse('A="a=\n\nB=b')
    console.log(tokens)
    assert.deepEqual(tokens, [
      {
        line: 'A="a=\n\nB=b',
        key: 'A',
        value: 'a=\n\nB=b',
        quoteChar: '"',
        comment: ''
      }
    ])
  })

  it('shall parse into tokens', async function () {
    const filename = './fixtures/dotenv/env'
    await testCase(filename)
  })

  it('shall parse multiline', async function () {
    const filename = './fixtures/dotenv/multiline'
    await testCase(filename)
  })

  it('shall parse large value', async function () {
    const filename = './fixtures/dotenv/large'
    await testCase(filename)
  })
})
