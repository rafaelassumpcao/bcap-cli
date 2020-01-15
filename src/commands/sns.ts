import { CustomToolbox } from '../types'

module.exports = {
  name: 'sns',
  description: 'Busca por todas as notificações em um determinado dia',
  run: async (toolbox: CustomToolbox) => {
    const { print, awsSns, awsSqs,prompt, filesystem } = toolbox
    const Bucket = 'brasilcap-sns-history-notification';

    const spinner = print.spin('Carregando tópicos...')
    const { Topics } = await awsSns.getTopics()
    spinner.succeed('Tópicos carregados')

   // print.debug(Topics)
    const isOnlyProduction = await prompt.confirm('Desejar Listar apenas tópicos de producão ?', true);
  
    const getEnvTag = (arn='') =>  arn.slice(-3).toLowerCase()
   
    let topicsArns = [];
    if(isOnlyProduction) {
      topicsArns = Topics.map(topic => topic.TopicArn).filter(tp => getEnvTag(tp) === 'prd')
    } else {
      topicsArns = Topics.map(topic => topic.TopicArn)
    }
  

    let { topicChoosed, dateChoosed } = await prompt.ask([
      {
        type: 'autocomplete',
        name: 'topicChoosed',
        message: 'Escolha o SNS para recuperar as notficações',
        choices: topicsArns,
        sort: true,
        scroll: true,
        suggest(s, choices) {
          return choices.filter(({ message }) =>
            message.toLowerCase().includes(s.toLowerCase())
          )
        }
      },
      {
        type: 'input',
        name: 'dateChoosed',
        message: 'Qual a data da notificação ? (YYYY-MM-DD)'
      }
    ])

    dateChoosed = dateChoosed.split('-').map(Number).join('-')
    const pathToFile = 
      `${awsSqs.BASE_SNS_DIR}/${awsSqs.getDir(topicChoosed)}/${dateChoosed}.json`;
    if(await filesystem.existsAsync(pathToFile) === 'file') {
      print.info(
        `Mensagem gerada anteriormente em:
          ${pathToFile}`
      )
      return;
    }

    spinner.start('Carregando obejtos do bucket...')
   // spinner.text = 'Carregando mensagens...'
    const msgs = await awsSqs.getMessages({
      Bucket,
      Prefix: topicChoosed + "/" + dateChoosed
    })
   // spinner.text = 'Mensagens carregadas...'
   // spinner.text= `Salvando em ${awsSqs.BASE_SNS_DIR}`
    print.info(`Salvando em ${awsSqs.BASE_SNS_DIR}/${awsSqs.getDir(topicChoosed)}`)
    await awsSqs.saveMessages({
      messages: msgs,
      topic: topicChoosed,
      date: dateChoosed
    })
    spinner.succeed('Processo concluido com sucesso!')
    
  }
}
