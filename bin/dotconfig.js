#!/usr/bin/env node

import { cli, log } from '../src/cli/index.js'

try {
  cli()
} catch (err) {
  log(err)
  console.error('✘ Error: ' + err.message)
}
