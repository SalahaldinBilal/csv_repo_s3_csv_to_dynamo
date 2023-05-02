import type { S3Event } from 'aws-lambda'
import { handler } from './index'

const test = async () => {
  const testData: S3Event = {
    Records: [{
      eventVersion: "",
      eventSource: "",
      awsRegion: "",
      eventTime: "",
      eventName: "",
      userIdentity: {
        principalId: "",
      },
      requestParameters: {
        sourceIPAddress: "",
      },
      responseElements: {
        'x-amz-request-id': "",
        'x-amz-id-2': "",
      },
      s3: {
        s3SchemaVersion: "",
        configurationId: "",
        bucket: {
          name: "salah-csv-repo",
          ownerIdentity: {
            principalId: "",
          },
          arn: "",
        },
        object: {
          key: "test_file (3).csv",
          size: 0,
          eTag: "",
          versionId: undefined,
          sequencer: "",
        },
      }
    }]
  }

  const response = await handler(testData, undefined as any, undefined as any);
  console.log(response)
  process.exit(1)
}

test();