// export types
export interface SNSTopics {
  Topics: Topic[]
  NextToken?: string
}

interface Topic {
  TopicArn: string
}
