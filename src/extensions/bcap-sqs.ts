import { CustomToolbox } from '../types'

module.exports = (toolbox: CustomToolbox) => {
  //   const AWS = require('aws-sdk')
  //   const s3 = new AWS.S3({ apiVersion: '2019-03-31', region: 'sa-east-1' })
  //   const { filesystem, print, util } = toolbox

  // const BASE_DIR = `${filesystem.homedir()}/.bcap`;

  //   function getDir(arn: string): string {
  //     if (!arn) throw new Error('arn não informado para obter diretorio')
  //     return arn.split(':')[5]
  //   }

  //   async function getAllMessages(keys, Bucket) {
  //     return Promise.all(
  //       keys.map(async Key =>
  //         (
  //           await s3
  //             .getObject({
  //               Bucket,
  //               Key
  //             })
  //             .promise()
  //         ).Body.toString('utf-8')
  //       )
  //     )
  //   }

  //   function toJSON(msgs, spaces = 2) {
  //     return JSON.stringify(msgs, null, spaces)
  //   }

  //   async function saveMessages({ messages, topic, date, type = 'SQS' }) {
  //     const path = `${util.BASE_DIR}/${type}/${getDir(topic)}/${date}.json`
  //     return filesystem.writeAsync(path, messages)
  //   }

  //   async function getMessages({
  //     Bucket,
  //     Prefix,
  //     ContinuationToken,
  //     MaxKeys = 1000,
  //     list = [],
  //     page = 1
  //   }) {
  //     try {
  //       const response = await s3
  //         .listObjectsV2({
  //           Bucket,
  //           MaxKeys,
  //           Prefix,
  //           ContinuationToken
  //         })
  //         .promise()
  //       print.info(`página ${page}`)
  //       const files: S3ObjectResponse[] = await Promise.all(
  //         response.Contents.map(res =>
  //           s3
  //             .getObject({
  //               Bucket,
  //               Key: res.Key
  //             })
  //             .promise()
  //         )
  //       )
  //       list = list.concat(files.map(file => file.Body.toString('utf-8')))
  //       return response.IsTruncated
  //         ? getMessages({
  //             Bucket,
  //             list,
  //             Prefix,
  //             ContinuationToken: response.NextContinuationToken,
  //             page: ++page
  //           })
  //         : list
  //     } catch (error) {
  //       console.log(error)
  //       throw new Error('s3.listObjectsV2 failed')
  //     }
  //   }

  toolbox.awsSqs = {}
}
