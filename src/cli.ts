const { build } = require('gluegun')

/**
 * Create the cli and kick it off
 */
async function run(argv) {
  // create a CLI runtime
  const cli = build()
    .brand('bcap')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'bcap-*', hidden: true })
    // .help() // provides default for help, h, --help, -h
    // .version() // provides default for version, v, --version, -v
    .exclude([
      // 'meta',
      'strings',
      'semver',
      'system',
      'http',
      'template',
      'patch'
    ])
    .create()

  const toolbox = await cli.run(argv)

  // send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
