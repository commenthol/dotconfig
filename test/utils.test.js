import { equal } from 'assert/strict'
import { toNumber, toBoolean, isInteger } from '../src/utils.js'

describe('utils', function () {
  it('isInteger', function () {
    equal(isInteger(0), true)
    equal(isInteger(Number.MIN_SAFE_INTEGER), true)
    equal(isInteger(Number.MIN_SAFE_INTEGER - 1), false)
    equal(isInteger(Number.MAX_SAFE_INTEGER), true)
    equal(isInteger(Number.MAX_SAFE_INTEGER + 1), false)
    equal(isInteger(0.1), false)
    equal(isInteger('string'), false)
    equal(isInteger(true), false)
    equal(isInteger([]), false)
    equal(isInteger({}), false)
  })

  it('toNumber', function () {
    equal(toNumber(0), 0)
    equal(toNumber('0'), 0)
    equal(toNumber(0.123), 0.123)
    equal(toNumber('0.123'), 0.123)
    equal(toNumber(NaN), undefined)
    equal(toNumber('NaN'), undefined)
    equal(toNumber(true), undefined)
    equal(toNumber([]), undefined)
    equal(toNumber({}), undefined)
  })

  it('toBoolean', function () {
    equal(toBoolean('true'), true)
    equal(toBoolean('false'), false)
    equal(toBoolean(true), true)
    equal(toBoolean(false), false)
    equal(toBoolean('NaN'), undefined)
    equal(toBoolean('True'), undefined)
    equal(toBoolean(1), undefined)
    equal(toBoolean(0), undefined)
  })
})
