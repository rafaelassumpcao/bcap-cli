import { SNSTopics, CustomToolbox } from '../types'

module.exports = (toolbox: CustomToolbox) => {
  const AWS = require('aws-sdk')
  const sns = new AWS.SNS({ apiVersion: '2019-03-31', region: 'sa-east-1' })
  const { filesystem, print } = toolbox

  const SNS_CACHE = `${filesystem.homedir()}/.bcap/.sns_topics`

  let cachedTopics: SNSTopics | false = false

  // get topics
  async function getTopics(): Promise<SNSTopics | false> {
    // buscas os topicos do cache
    if (cachedTopics) return cachedTopics

    // busca do arquivo
    if (!filesystem.exists(SNS_CACHE)) {
      // busca da amazon no primeiro acesso do usuario
      const spinner = print.spin('Carregando topicos SNS da nuvem...')
      try {
        cachedTopics = await readFromCloud()
        print.info('Gravando no cache...')
        await persist(cachedTopics)
        spinner.stop()
      } catch (error) {
        spinner.fail('Não foi possivel carregar tópicos da nuvem')
        print.error(error)
      }
    } else {
      // busca do arquivo cacheado
      const spinner = print.spin('Carregando topicos SNS do cache local ...')
      try {
        cachedTopics = await readFromLocalCache()
        spinner.stop()
      } catch (error) {
        spinner.fail('Não foi possivel carregar tópicos do cache local')
        print.error(error)
      }
    }

    return cachedTopics
  }

  async function readFromLocalCache(): Promise<SNSTopics | false> {
    return (
      filesystem.exists(SNS_CACHE) && filesystem.readAsync(SNS_CACHE, 'json')
    )
  }

  async function persist(data): Promise<void> {
    try {
      return filesystem.writeAsync(SNS_CACHE, data)
    } catch (error) {
      print.error(error)
    }
  }

  async function readFromCloud(): Promise<SNSTopics | false> {
    // fake first read
    const topicsResult = await sns.listTopics().promise()
    for (let i = 1; i <= 1000; i++) {
      if (!topicsResult.NextToken) {
        break
      }
      console.log(`buscando pagina ${i}`)
      const { Topics: moreTopics, NextToken } = await sns
        .listTopics({ NextToken: topicsResult.NextToken })
        .promise()
      topicsResult.NextToken = NextToken
      topicsResult.Topics.push(moreTopics)
    }
    return Promise.resolve(topicsResult)
  }

  // load all topics
  return (toolbox.awsSns = { getTopics })
}
