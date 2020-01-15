import { CustomToolbox, S3ObjectResponse } from '../types'



module.exports = (toolbox: CustomToolbox) => {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({apiVersion: '2019-03-31', region: 'sa-east-1'})
    const { filesystem, print } = toolbox

    const BASE_SNS_DIR = `${filesystem.homedir()}/sns_gerados`;

    function getDir(arn: string): string {
        if(!arn) throw new Error('arn não informado para obter diretorio')
        return arn.split(':')[5]
    }

    // async function allBucketKeys(params: S3Api) {
    //   let keys = [];
    //   for (;;) {
    //     let data = await s3.listObjects(params).promise();
    //     print.debug(data)
    //     data.Contents.forEach((elem) => {
    //       keys = keys.concat(elem.Key);
    //     });
    
    //     if (!data.IsTruncated) {
    //       break;
    //     }
    //     params.Marker = data.NextMarker;
    //   }
    
    //   return keys;
    // }

    async function getAllMessages(keys, Bucket) {
        return Promise.all(
            keys.map(
                async Key =>  (await s3.getObject({
                    Bucket,
                    Key,
                }).promise()).Body.toString('utf-8')
            )
        )
       
    }

    function toJSON(msgs, spaces=2) {
        return JSON.stringify(msgs, null, spaces)
    }

    async function saveMessages({ messages, topic, date }) {
        const path = `${BASE_SNS_DIR}/${getDir(topic)}/${date}.json`
        return filesystem.writeAsync(path, messages)
    }

    async function getMessages(
        { 
            Bucket, 
            Prefix, 
            ContinuationToken,
            MaxKeys=1000,
            list=[],
            page= 1,
        }
    ) {

        try {
            const response =  await s3.listObjectsV2({
                Bucket,
                MaxKeys,
                Prefix,
                ContinuationToken
            }).promise()
            print.info(`página ${page}`);
            const files: S3ObjectResponse[] = await Promise.all(
                response.Contents.map(
                    res => s3.getObject({
                        Bucket,
                        Key: res.Key,
                    }).promise())
            )
            list = list.concat(files.map(file => file.Body.toString('utf-8')));
            return response.IsTruncated 
                ? getMessages({
                    Bucket, 
                    list, 
                    Prefix,
                    ContinuationToken: response.NextContinuationToken,
                    page: ++page,
                })
                : list  
        } catch (error) {
            console.log(error)
            throw new Error('s3.listObjectsV2 failed')
        }
    }


    toolbox.awsSqs = { 
        getMessages, 
        getDir, 
        toJSON, 
        getAllMessages ,
        saveMessages,
        BASE_SNS_DIR
    }
 
}


