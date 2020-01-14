import { CustomToolbox, S3Api } from '../types'



module.exports = (toolbox: CustomToolbox) => {
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({apiVersion: '2019-03-31', region: 'sa-east-1'})
    const { filesystem } = toolbox

    const BASE_SNS_DIR = `${filesystem.homedir()}/sns_gerados`;

    function getDir(arn: string): string {
        if(!arn) throw new Error('arn não informado para obter diretorio')
        return arn.split(':')[5]
    }

    async function allBucketKeys(params: S3Api) {
      let keys = [];
      for (;;) {
        var data = await s3.listObjects(params).promise();
    
        data.Contents.forEach((elem) => {
          keys = keys.concat(elem.Key);
        });
    
        if (!data.IsTruncated) {
          break;
        }
        params.Marker = data.NextMarker;
      }
    
      return keys;
    }

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
        const path = `${BASE_SNS_DIR}/${getDir(topic)}/${date}`
        return filesystem.writeAsync(path, messages)
    }


    toolbox.awsSqs = { 
        allBucketKeys, 
        getDir, 
        toJSON, 
        getAllMessages ,
        saveMessages,
        BASE_SNS_DIR
    }
 
}


