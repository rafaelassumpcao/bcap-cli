import { CustomToolbox, S3ObjectResponse } from '../types'
const open = require('open')
module.exports = (toolbox: CustomToolbox) => {
  const AWS = require('aws-sdk')
  const s3 = new AWS.S3({ apiVersion: '2019-03-31', region: 'sa-east-1' })

  const { filesystem, print, prompt } = toolbox
  const BASE_DIR = `${filesystem.homedir()}/.bcap`

  async function openFileOnChrome(path) {
    const filePath = `${path}`
    // print.debug(filePath)

    const name = getChromeNameByOS()
    // print.debug(name)
    return open(filePath, { app: name })
  }

  function getChromeNameByOS() {
    const { platform } = process
    // const osNames = {
    //   linux: 'google-chrome',
    //   win32: 'chrome',
    //   darwin: 'google chrome'
    // }
    const osNames = {
      linux: 'Visual Studio Code',
      win32: 'Visual Studio Code',
      darwin: 'Visual Studio Code'
    }
    return osNames[platform]
  }

  function getDir(arn: string): string {
    if (!arn) throw new Error('arn não informado para obter diretorio')
    return arn.split(':')[5]
  }

  async function saveMessages({ messages, topic, date, type = 'SQS' }) {
    const path = `${BASE_DIR}/${type}/${getDir(topic)}/${date}.json`
   // print.debug(messages)
    return filesystem.writeAsync(path, messages.map(JSON.parse), {jsonIndent: 2})
  }

  async function getMessagesFromS3({
    Bucket,
    Prefix,
    ContinuationToken,
    MaxKeys = 1000,
    list = [],
    page = 1
  }) {
    try {
      // fake
      const response = await s3
        .listObjectsV2({
          Bucket,
          MaxKeys,
          Prefix,
          ContinuationToken
        })
        .promise()
      print.info(`página ${page}`)
      const files: S3ObjectResponse[] = await Promise.all(
        response.Contents.map(res =>
          s3
            .getObject({
              Bucket,
              Key: res.Key
            })
            .promise()
        )
      )
      list = list.concat(files.map(file => file.Body.toString('utf-8')))
      return response.IsTruncated
        ? getMessagesFromS3({
            Bucket,
            list,
            Prefix,
            ContinuationToken: response.NextContinuationToken,
            page: ++page
          })
        : list
    } catch (error) {
      console.log(error)
      throw new Error('s3.listObjectsV2 failed')
    }
  }
  async function listingFolders({
    type = 'SNS',
    path = BASE_DIR,
    isLeaf = false,
    depth = 0,
    historyPath = null
  }) {
    // const paths = await filesystem.findAsync(path, {
    //   matching: [`${path}/${type}/**/*.json`, '!.sns_topics']
    // })
    // print.debug({
    //   type,
    //   path,
    //   isLeaf,
    //   depth,
    //   historyPath
    // })
    const baseDirWithType = depth === 0 ? `${path}/${type}` : historyPath
    const dirs = await filesystem.listAsync(baseDirWithType)

    if (isLeaf) {
      const { filesSelected } = await prompt.ask({
        type: 'multiselect',
        name: 'filesSelected',
        message: 'Escolha os arquivos para serem abertos',
        hint: 'espaço - marcar/desmarcar',
        choices: [...dirs]
      })

      print.info('Abrindo arquivo no navegador...')
      await Promise.all(
        filesSelected.map(fileName =>
          openFileOnChrome(`${baseDirWithType}/${fileName}`)
        )
      )
      if (await prompt.confirm('Deseja continuar a busca por aquivos?')) {
        return listingFolders({
          depth: 0,
          isLeaf: false
        })
      }
      return
    } else {
      const { choosedDir } = await prompt.ask({
        type: 'autocomplete',
        name: 'choosedDir',
        message: 'Escolha um diretório...',
        choices: [...dirs],
        sort: true,
        scroll: true,
        suggest(s, choices) {
          return choices.filter(({ message }) =>
            message.toLowerCase().includes(s.toLowerCase())
          )
        }
      })
      // print.debug(dirs)
      const nextPath = `${baseDirWithType}/${choosedDir}`
      return listingFolders({
        historyPath: nextPath,
        isLeaf:
          dirs &&
          dirs.length &&
          (await filesystem.listAsync(nextPath))[0].includes('.json'),
        depth: ++depth
      })
    }
    // const filesInDirs = await Promise.all(
    //   dirs.map(async dir => ({
    //     [dir]: await filesystem.listAsync(`${baseDirWithType}/${dir}`)
    //   }))
    // )
    // print.debug(dirs)
    // print.debug(filesInDirs)
    // return paths.map(c => fsPath.parse(filesystem.resolve(c)))
  }

  return (toolbox.util = {
    openFileOnChrome,
    saveMessages,
    BASE_DIR,
    getDir,
    getMessagesFromS3,
    listingFolders
  })
}
