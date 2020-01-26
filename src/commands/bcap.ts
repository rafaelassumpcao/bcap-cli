import { CustomToolbox } from '../types'

module.exports = {
  name: 'bcap',
  description: 'Seja Bem-vindo(a)',
  run: async (toolbox: CustomToolbox) => {
    toolbox.print.info(`
    ██████╗  ██████╗ █████╗ ██████╗
    ██╔══██╗██╔════╝██╔══██╗██╔══██╗
    ██████╔╝██║     ███████║██████╔╝
    ██╔══██╗██║     ██╔══██║██╔═══╝
    ██████╔╝╚██████╗██║  ██║██║
    ╚═════╝  ╚═════╝╚═╝  ╚═╝╚═╝
    `)
    toolbox.print.printCommands(toolbox)
  }
}
