import { CustomToolbox, S3ObjectResponse } from '../types'
const open = require('open')
module.exports = (toolbox: CustomToolbox) => {
  const AWS = require('aws-sdk')
  const s3 = new AWS.S3({ apiVersion: '2019-03-31', region: 'sa-east-1' })

  const { filesystem, print, prompt } = toolbox
  const BASE_DIR = `${filesystem.homedir()}/.bcap`

  async function openFileOnChrome(path) {
    const filePath = `file://${path}`
    // print.debug(filePath)

    const name = getChromeNameByOS()
    // print.debug(name)
    return open(filePath, { app: name })
  }

  function getChromeNameByOS() {
    const { platform } = process
    const osNames = {
      linux: 'google-chrome',
      win32: 'chrome',
      darwin: 'google chrome'
    }
    return osNames[platform]
  }

  function getDir(arn: string): string {
    if (!arn) throw new Error('arn não informado para obter diretorio')
    return arn.split(':')[5]
  }

  async function saveMessages({ messages, topic, date, type = 'SQS' }) {
    const path = `${BASE_DIR}/${type}/${getDir(topic)}/${date}.json`
    return filesystem.writeAsync(path, messages)
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
      return [
        {
          _id: '5e2cfcb30b930a94449555ba',
          index: 0,
          guid: '5372340e-8397-41b6-bb5e-8d1dc0d04ef2',
          isActive: false,
          balance: '$3,201.58',
          picture: 'http://placehold.it/32x32',
          age: 35,
          eyeColor: 'brown',
          name: 'Dianne Berger',
          gender: 'female',
          company: 'AVIT',
          email: 'dianneberger@avit.com',
          phone: '+1 (844) 594-2922',
          address: '735 Chester Court, Nescatunga, Alabama, 7919',
          about:
            'Fugiat eiusmod quis aute officia consectetur sint ex. Velit aliqua velit reprehenderit est. Deserunt elit nulla Lorem consectetur aliqua anim. Ad nulla velit ex dolore. Adipisicing nisi ad id in velit duis esse sunt ea ut. Elit exercitation magna do labore voluptate dolore velit nulla consequat. Lorem velit dolore eu minim ea aliquip in.\r\n',
          registered: '2016-10-27T10:24:45 +03:00',
          latitude: -3.603342,
          longitude: 97.023643
        },
        {
          _id: '5e2cfcb3a212da9f59771cd6',
          index: 1,
          guid: '182093e7-1688-447a-a0a0-66f432a2b189',
          isActive: true,
          balance: '$3,028.17',
          picture: 'http://placehold.it/32x32',
          age: 33,
          eyeColor: 'blue',
          name: 'Jean Roberts',
          gender: 'female',
          company: 'EARGO',
          email: 'jeanroberts@eargo.com',
          phone: '+1 (843) 408-3191',
          address: '734 Judge Street, Westboro, New York, 9350',
          about:
            'Non commodo reprehenderit occaecat quis deserunt est ullamco do nostrud est sint incididunt. Enim duis fugiat pariatur duis tempor non officia sit sunt. Sunt enim id non deserunt occaecat Lorem magna laboris sit minim nulla eiusmod quis elit. Deserunt tempor labore laboris ullamco eu occaecat est aute. Excepteur sint Lorem ullamco incididunt esse ea occaecat sunt do. Duis deserunt ullamco deserunt enim anim veniam non occaecat voluptate incididunt sunt proident sit commodo.\r\n',
          registered: '2015-07-15T11:38:09 +03:00',
          latitude: 86.736416,
          longitude: -0.491326
        },
        {
          _id: '5e2cfcb38c2136835f0e9b94',
          index: 2,
          guid: '2f58c094-aa30-45b2-8c1a-8287767385a9',
          isActive: true,
          balance: '$2,462.44',
          picture: 'http://placehold.it/32x32',
          age: 40,
          eyeColor: 'blue',
          name: 'Newton Pearson',
          gender: 'male',
          company: 'PRISMATIC',
          email: 'newtonpearson@prismatic.com',
          phone: '+1 (847) 513-3460',
          address: '401 Irving Place, Martell, New Hampshire, 3407',
          about:
            'Sint amet officia fugiat ut aute eu velit enim velit nulla elit. Proident officia ut non ex deserunt nostrud pariatur. Eu ut eiusmod aliquip sint consectetur Lorem cupidatat laborum eu veniam cupidatat cupidatat qui nostrud. Proident ut officia ex minim tempor. Et cupidatat dolor minim ea commodo ut nisi culpa incididunt mollit occaecat. Reprehenderit anim sit amet nostrud incididunt officia fugiat qui veniam.\r\n',
          registered: '2015-07-19T10:11:03 +03:00',
          latitude: 12.421924,
          longitude: 82.578488
        },
        {
          _id: '5e2cfcb3005637191cb22529',
          index: 3,
          guid: 'af48f180-9c96-4e71-8e6f-633e7e8856b9',
          isActive: true,
          balance: '$3,537.57',
          picture: 'http://placehold.it/32x32',
          age: 32,
          eyeColor: 'green',
          name: 'Levine Lara',
          gender: 'male',
          company: 'KONGLE',
          email: 'levinelara@kongle.com',
          phone: '+1 (954) 475-3595',
          address: '863 Cheever Place, Bowmansville, Maryland, 7142',
          about:
            'Excepteur pariatur mollit labore pariatur aliqua ut non deserunt consectetur anim sit labore. In proident ut est deserunt amet dolore ea non voluptate. Nulla aliquip reprehenderit commodo tempor anim sint elit labore aliquip anim reprehenderit. Id dolor fugiat aliquip officia reprehenderit. Consectetur culpa id nulla excepteur officia minim cupidatat voluptate anim quis.\r\n',
          registered: '2016-07-12T01:46:50 +03:00',
          latitude: 65.733658,
          longitude: -92.018303
        },
        {
          _id: '5e2cfcb3ebd8feabf0fac82b',
          index: 4,
          guid: '7d641c94-3af7-4029-838f-f124fe480c80',
          isActive: true,
          balance: '$3,199.46',
          picture: 'http://placehold.it/32x32',
          age: 38,
          eyeColor: 'blue',
          name: 'Henry Ortiz',
          gender: 'male',
          company: 'COMFIRM',
          email: 'henryortiz@comfirm.com',
          phone: '+1 (889) 506-3165',
          address: '451 Howard Alley, Tilleda, Montana, 8071',
          about:
            'Aliquip labore officia elit sunt reprehenderit sint. Irure non sit ullamco amet deserunt laboris labore nulla magna. Excepteur magna tempor nisi non aliqua. Officia aute incididunt id sunt est.\r\n',
          registered: '2016-10-29T02:00:21 +03:00',
          latitude: 34.908939,
          longitude: -126.442421
        },
        {
          _id: '5e2cfcb3e669aaa5c44b0bf4',
          index: 5,
          guid: 'a6fe86d3-f4da-4b3c-9046-6c0c7f50e867',
          isActive: true,
          balance: '$1,212.87',
          picture: 'http://placehold.it/32x32',
          age: 39,
          eyeColor: 'blue',
          name: 'Mays Greene',
          gender: 'male',
          company: 'DEVILTOE',
          email: 'maysgreene@deviltoe.com',
          phone: '+1 (938) 553-3603',
          address: '687 Pioneer Street, Bergoo, North Carolina, 2485',
          about:
            'Aliquip ea in esse labore aute deserunt. Voluptate non dolor quis aliquip quis pariatur sint aliquip. Aliqua ipsum non qui sit qui proident enim. Nostrud anim veniam dolore reprehenderit mollit velit ullamco. Ipsum sint minim magna nulla anim deserunt tempor aute fugiat exercitation commodo laboris quis occaecat.\r\n',
          registered: '2016-07-29T08:38:00 +03:00',
          latitude: 2.934732,
          longitude: -143.39967
        },
        {
          _id: '5e2cfcb32b13c73f3882c73b',
          index: 6,
          guid: '367605cc-f4a7-4d53-a5f7-e78e2e037ef6',
          isActive: false,
          balance: '$3,017.77',
          picture: 'http://placehold.it/32x32',
          age: 20,
          eyeColor: 'blue',
          name: 'Ashley Summers',
          gender: 'male',
          company: 'TELEQUIET',
          email: 'ashleysummers@telequiet.com',
          phone: '+1 (814) 482-3311',
          address: '593 Hemlock Street, Woodlake, Iowa, 3253',
          about:
            'Exercitation labore non nostrud adipisicing velit occaecat pariatur dolore. Mollit pariatur laboris ex quis. Proident est reprehenderit pariatur excepteur eiusmod aute non aliqua est non. Reprehenderit commodo aliquip ullamco duis labore mollit veniam. Do eiusmod aliquip labore esse voluptate eiusmod culpa ipsum voluptate enim.\r\n',
          registered: '2017-08-30T12:55:27 +03:00',
          latitude: 88.834921,
          longitude: -97.130192
        },
        {
          _id: '5e2cfcb3e2a50191eec1674b',
          index: 7,
          guid: '0d4f690c-d0d9-4543-a13c-97a66261f5cc',
          isActive: false,
          balance: '$3,638.19',
          picture: 'http://placehold.it/32x32',
          age: 26,
          eyeColor: 'brown',
          name: 'Francis Osborn',
          gender: 'male',
          company: 'NAXDIS',
          email: 'francisosborn@naxdis.com',
          phone: '+1 (815) 532-2442',
          address: '258 Orange Street, Monument, Michigan, 7947',
          about:
            'Aute est ipsum velit ipsum dolore enim occaecat eiusmod pariatur exercitation amet. Sint sit elit et ullamco veniam nulla fugiat duis ullamco. Ea pariatur duis proident amet aliquip non minim ut esse. Veniam culpa est voluptate ut. Aute adipisicing laboris culpa cupidatat labore commodo excepteur.\r\n',
          registered: '2014-03-31T07:09:41 +03:00',
          latitude: 6.510769,
          longitude: -61.496136
        },
        {
          _id: '5e2cfcb3fc56267fc6a06927',
          index: 8,
          guid: '2e32e51b-74a0-4d29-b3fe-83eebdb80e87',
          isActive: true,
          balance: '$2,606.73',
          picture: 'http://placehold.it/32x32',
          age: 37,
          eyeColor: 'brown',
          name: 'Howard Garza',
          gender: 'male',
          company: 'QUORDATE',
          email: 'howardgarza@quordate.com',
          phone: '+1 (868) 444-3662',
          address: '610 Wyona Street, Kohatk, District Of Columbia, 705',
          about:
            'Amet irure exercitation laborum eiusmod duis excepteur exercitation velit. Nostrud cillum laboris elit excepteur Lorem aliqua exercitation laborum nisi eiusmod laborum sint veniam. Labore amet sint Lorem labore id labore non ipsum cillum. Elit laborum consectetur exercitation voluptate pariatur.\r\n',
          registered: '2015-08-17T04:02:54 +03:00',
          latitude: 18.743551,
          longitude: 17.034186
        },
        {
          _id: '5e2cfcb33d81387c998d9bb4',
          index: 9,
          guid: '00ab78a0-4006-4c1f-bd85-4be118970b47',
          isActive: true,
          balance: '$2,110.87',
          picture: 'http://placehold.it/32x32',
          age: 38,
          eyeColor: 'green',
          name: 'Sara Johns',
          gender: 'female',
          company: 'GLUKGLUK',
          email: 'sarajohns@glukgluk.com',
          phone: '+1 (967) 566-2079',
          address: '204 Leonora Court, Springhill, Louisiana, 3636',
          about:
            'Elit enim sint voluptate ullamco sit et esse incididunt eu elit ipsum minim Lorem. Excepteur occaecat irure Lorem reprehenderit est aute est. Nisi nulla laboris deserunt veniam eu consequat sit ullamco ipsum et laboris. In minim magna Lorem ut veniam. Reprehenderit sit consectetur nisi culpa proident duis do.\r\n',
          registered: '2014-03-30T02:13:00 +03:00',
          latitude: 29.459023,
          longitude: 59.090522
        }
      ]
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
