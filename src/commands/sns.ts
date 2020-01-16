import { CustomToolbox } from '../types'

module.exports = {
  name: 'sns',
  description: 'Busca por todas as notificações em um determinado dia',
  run: async (toolbox: CustomToolbox) => {
    const {
      print,
      awsSns,
      awsSqs,
      prompt,
      filesystem,
      parameters: { options }
    } = toolbox
    const Bucket = 'brasilcap-sns-history-notification'

    print.debug(options)
    if (options.list) {
      const path = `${awsSqs.BASE_SNS_DIR}/${options.list.split('.')[0]}.json`
      print.debug(path)
      if ((await filesystem.existsAsync(path)) === 'file') {
        const data = await filesystem.readAsync(path, 'json')
        print.debug(data)
        const fields = Object.keys(data[0])
        let { fiedsToDisplay } = await prompt.ask(
          [
            {
              type: 'multiselect',
              name: 'fiedsToDisplay',
              message: 'Escolha os campos de apresentação',
              hint: 'espaço - marcar/desmarcar',
              choices: fields,
              initial: fields
            }
            // {
            //   type: 'select',
            //   name: 'filterChoosed',
            //   message: 'Escolha um campo para filtrar'
          ] // }
        )
        // print.debug(fiedsToDisplay)
        // let shouldFilter = await prompt.confirm(
        //   'Deseja Filtrar por algum campo?'
        // )
        //print.info(shouldFilter)

        let filterBy = await prompt.ask([
          {
            type: 'select',
            name: 'filterBy',
            message: 'Escolha um campo para filtrar',
            skip: true,
            choices: fiedsToDisplay
          }
        ])

        // print.debug(shouldFilter)
        print.debug(filterBy)
        // print.debug(fiedsToDisplay)
        // print.debug(data)
        const result = data.map(obj =>
          Object.fromEntries([
            ...fiedsToDisplay.map(({ value }) => [value, obj[value]])
          ])
        )
        print.debug(result)
        // print.debug(result)
        // print.table(
        //   [Object.keys(result[0]), ...result.map(x => Object.values(x))],
        //   {
        //     format: 'markdown'
        //   }
        // )
        // data.map(obj =>
        //   fiedsToDisplay.reduce(
        //     (acc, { value }) => ({ [value]: obj[value] }),
        //     {}
        //   )
        // )
        // .filter(obj => {
        //   return !shouldFilter
        //     ? true
        //     : filterBy.toString() === obj[filterBy].toString()
        // })
      }
      return
    }

    const spinner = print.spin('Carregando tópicos...')
    const { Topics } = await awsSns.getTopics()
    spinner.succeed('Tópicos carregados')

    // print.debug(Topics)
    const isOnlyProduction = await prompt.confirm(
      'Desejar Listar apenas tópicos de producão ?',
      true
    )

    const getEnvTag = (arn = '') => arn.slice(-3).toLowerCase()

    let topicsArns = []
    if (isOnlyProduction) {
      topicsArns = Topics.map(topic => topic.TopicArn).filter(
        tp => getEnvTag(tp) === 'prd'
      )
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
        },
        separator: true
      },
      {
        type: 'input',
        name: 'dateChoosed',
        message: 'Qual a data da notificação ? (YYYY-MM-DD)'
      }
    ])

    dateChoosed = dateChoosed
      .split('-')
      .map(Number)
      .join('-')
    const pathToFile = `${awsSqs.BASE_SNS_DIR}/${awsSqs.getDir(
      topicChoosed
    )}/${dateChoosed}.json`
    if ((await filesystem.existsAsync(pathToFile)) === 'file') {
      print.info(
        `Mensagem gerada anteriormente em:
          ${pathToFile}`
      )
      return
    }

    spinner.start('Carregando obejtos do bucket...')
    // spinner.text = 'Carregando mensagens...'
    const msgs = await awsSqs.getMessages({
      Bucket,
      Prefix: topicChoosed + '/' + dateChoosed
    })

    if (!msgs.length) {
      spinner.stop()
      print.warning(
        'Não foram encontradas mensagens... arquivo não será gerado'
      )
    }
    // spinner.text = 'Mensagens carregadas...'
    // spinner.text= `Salvando em ${awsSqs.BASE_SNS_DIR}`
    print.info(
      `Salvando em ${awsSqs.BASE_SNS_DIR}/${awsSqs.getDir(topicChoosed)}`
    )
    await awsSqs.saveMessages({
      messages: msgs,
      topic: topicChoosed,
      date: dateChoosed
    })
    spinner.succeed('Processo concluido com sucesso!')
  }
}
