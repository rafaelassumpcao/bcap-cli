import { GluegunToolbox } from 'gluegun'
import { SNSTopics } from '../types'

// import AWS from 'aws-sdk'

module.exports = (toolbox: GluegunToolbox) => {
  const { filesystem, print, system } = toolbox

  const SNS_CACHE = `${filesystem.homedir()}/.topics`

  let cachedTopics: SNSTopics | false = false

  //get topics
  async function getTopics(): Promise<SNSTopics | false> {
    //buscas os topicos do cache
    if (cachedTopics) return cachedTopics

    // busca do arquivo
    if (!filesystem.exists(SNS_CACHE)) {
      // busca da amazon no primeiro acesso do usuario
      const spinner = print.spin('Carregando topicos SNS da nuvem...')
      await system.run('sleep 5')
      cachedTopics = await readFromCloud()
      spinner.text = 'Gravando no Cache...'
      await persist(cachedTopics)
      spinner.succeed('Carregado')
    } else {
      // busca do arquivo cacheado
      cachedTopics = await readFromLocalCache()
    }

    return cachedTopics
  }

  async function readFromLocalCache(): Promise<SNSTopics | false> {
    return (
      filesystem.exists(SNS_CACHE) && filesystem.readAsync(SNS_CACHE, 'json')
    )
  }

  async function persist(data): Promise<void> {
    return filesystem.writeAsync(SNS_CACHE, data)
  }

  async function readFromCloud(): Promise<SNSTopics | false> {
    // fake first read
    return Promise.resolve({
      Topics: [
        {
          TopicArn: 'arn:SNS_COBRANCA_RATEIO'
        },
        {
          TopicArn: 'arn:SNS_CONTABILIZA_PRO_RATA'
        },
        {
          TopicArn: 'arn:SNS_RESERVA_SALDO'
        },
        {
          TopicArn: 'arn:SNS_COBRANCA_CLIENTE'
        },
        {
          TopicArn: 'arn:SNS_TESTE'
        }
      ]
    })
  }

  // load all topics
  return (toolbox.awsSns = { getTopics })
}
