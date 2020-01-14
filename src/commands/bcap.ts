import { CustomToolbox } from '../types'

module.exports = {
  name: 'bcap',
  description: 'Comando base para apresentar comandos',
  run: async (toolbox: CustomToolbox) => {
    //const { print, awsSns } = toolbox
    // print.debug(toolbox)
    // //print.debug(awsSNS)
    // const topics = await awsSns.getTopics()
    // print.debug(topics)
  }
}
