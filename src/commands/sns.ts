import { GluegunToolbox, system } from 'gluegun'

module.exports = {
  name: 'sns',
  description: 'Busca por todas as notificações em um determinado dia',
  run: async (toolbox: GluegunToolbox) => {
    const { print, awsSns, prompt } = toolbox
    const { Topics } = await awsSns.getTopics()

    const result = await prompt.ask([
      {
        type: 'autocomplete',
        name: 'topicChoosed',
        message: 'Escolha o SNS para recuperar as notficações',
        choices: Topics.map(topic => topic.TopicArn),
        suggest(s, choices) {
          return choices.filter(({ message }) =>
            message.toLowerCase().includes(s.toLowerCase())
          )
        }
      },
      {
        type: 'input',
        name: 'dataChoosed',
        message: 'Qual a data da notificação ? (YYYY-MM-DD)'
      }
    ])
    const spinner = print.spin(`Buscando notificações... 👨‍💻`)
    await system.run('sleep 10')
    spinner.succeed('10 notificaoes encontras')
    print.info(result)
  }
}
