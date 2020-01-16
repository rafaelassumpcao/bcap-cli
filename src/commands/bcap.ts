import { CustomToolbox } from '../types'

module.exports = {
  name: 'bcap',
  description: 'Comando base para apresentar comandos',
  run: async (toolbox: CustomToolbox) => {
    toolbox.print.debug(toolbox.parameters.plugin)
  }
}
