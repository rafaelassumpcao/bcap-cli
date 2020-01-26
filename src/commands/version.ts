import { CustomToolbox } from '../types'

module.exports = {
  name: 'version',
  alias: 'v',
  description: 'mostra a versão instalada',
  run: async (toolbox: CustomToolbox) => {
    toolbox.print.info(toolbox.meta.version())
  }
}
