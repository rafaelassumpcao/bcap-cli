import { CustomToolbox } from '../../types'

module.exports = {
  name: 'sns',
  description: `Busca por mensagens enviadas por tópicos SNS
  \x1b[36m--list <path> \x1b[0m:
            lista as mensagens geradas em um arquivo ao executar o comando bcap sns
            bcap sns --list=SNS_EXEMPLO/2020-01-01.json (a extensão não é obrigatoria)
  `,
  run: async (toolbox: CustomToolbox) => {
    const {
      print,
      awsSns,
      prompt,
      filesystem,
      util,
      parameters: { options }
    } = toolbox
    const Bucket = 'brasilcap-sns-history-notification'
    // print.debug(util)
    if (options.list) {
      await util.listingFolders({})
      // print.debug(dados)
      return
      const path = `${util.BASE_DIR}/SNS/${options.list.split('.')[0]}.json`
      // print.debug(path)
      const spinner = print.spin(`Procurando arquivo...`)
      if ((await filesystem.existsAsync(path)) === 'file') {
        spinner.text = `Carregando arquivo ${path}`
        const data = await filesystem.readAsync(path, 'json')
        spinner.stop()
        // print.debug(data)
        const fields = Object.keys(data[0])
        const { fiedsToDisplay } = await prompt.ask({
          type: 'multiselect',
          name: 'fiedsToDisplay',
          message: 'Escolha os campos de apresentação',
          hint: 'espaço - marcar/desmarcar',
          choices: fields,
          initial: fields
        })
        // print.debug(fiedsToDisplay)
        const shouldFilter = await prompt.confirm(
          'Deseja Filtrar por algum campo?',
          false
        )
        // print.info(shouldFilter)

        // const { chaveFiltro, valorFiltro } = await prompt.ask([
        //   {
        //     type: 'select',
        //     name: 'chaveFiltro',
        //     message: 'Escolha um campo para filtrar',
        //     skip: !shouldFilter,
        //     choices: fiedsToDisplay
        //   },
        //   {
        //     type: 'input',
        //     name: 'valorFiltro',
        //     message: 'Qual o termo de pesquisa?'
        //   }
        // ])

        // print.debug(shouldFilter)
        // print.debug(filterBy)
        // print.debug(fiedsToDisplay)
        // print.debug(data)
        const TYPE_STRING = 'string'
        spinner.start('Aguarde...gerando apresentação dos dados\n')
        const result = data.map(obj =>
          [
            ...fiedsToDisplay.map(resp =>
              typeof resp === TYPE_STRING
                ? [resp, obj[resp]]
                : [resp.value, obj[resp.value]]
            )
          ].reduce((o, [k, v]) => ({ ...o, [k]: v }), {})
        )
        // print.debug(result)
        // print.debug(shouldFilter)
        if (shouldFilter) {
          print.table(
            [
              ['Resultado', 'linha'],
              [JSON.stringify(result[0], null, 2), 2]
            ],
            {
              format: 'lean'
            }
          )
        }
        // print.table(
        //   [Object.keys(result[0]), ...result.map(x => Object.values(x))],
        //   {
        //     format: 'lean'
        //   }
        // )
        spinner.stop()
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
      } else {
        spinner.fail('Arquivo não encontrado')
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
    const pathToFile = `${util.BASE_DIR}/SNS/${util.getDir(
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
    const msgs = await util.getMessagesFromS3({
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
    print.info(`Salvando em ${util.BASE_DIR}/SNS/${util.getDir(topicChoosed)}`)
    await util.saveMessages({
      messages: msgs,
      topic: topicChoosed,
      date: dateChoosed,
      type: 'SNS'
    })
    spinner.succeed('Processo concluido com sucesso!')
  }
}
