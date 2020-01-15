import { GluegunToolbox } from 'gluegun'
// export types
export interface SNSTopics {
  Topics: Topic[]
  NextToken?: string
  ResponseMetadata?: Object
}

interface Topic {
  TopicArn: string
}

// .exclude(['meta', 'strings', 'print', 'filesystem', 'semver', 'system', 'prompt', 'http', 'template', 'patching'])
export interface CustomToolbox extends GluegunToolbox {
  http: null
  system: null
  patching: null
  strings: null
  semver: null
  template: null
}

export interface S3Api {
  Bucket: string
  Prefix: string
  Key?: string
  Marker?: string
}

export interface S3ObjectResponse {
  Body: Buffer
}
