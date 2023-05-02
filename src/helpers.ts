import * as dotenv from 'dotenv'
import {
  CreateTableCommand,
  DynamoDBClient,
  BatchWriteItemCommand,
  PutRequest,
  DeleteTableCommand,
  waitUntilTableExists,
  waitUntilTableNotExists,
} from "@aws-sdk/client-dynamodb";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { CsvFile } from './types';
import csv from 'csvtojson';
dotenv.config();

const dynamoClient = new DynamoDBClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});

const s3Client = new S3Client({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
  }
});

export async function s3LoadFileContentsAsJson(key: string, bucketName: string): Promise<any[]> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  const response = await s3Client.send(command);
  return await csv().fromString(await response.Body?.transformToString()!);
}

export async function deleteDynamoTable(key: string) {
  const command = new DeleteTableCommand({
    TableName: key
  })

  return await dynamoClient.send(command);
}

export async function createDynamoTable(key: string) {
  const command = new CreateTableCommand({
    TableName: key,
    KeySchema: [
      { AttributeName: "id", KeyType: "HASH" },
    ],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1000,
      WriteCapacityUnits: 1000
    }
  })

  return await dynamoClient.send(command);
}

export function s3JsonToDynamoDbItem(jsonArray: Array<any>): PutRequest[] {
  return jsonArray.map((row, index) => {
    const finalObject: PutRequest = { Item: { id: { N: index.toString() } } };

    for (const [key, value] of Object.entries(row)) {
      finalObject.Item![key] = { S: `${value}` }
    }

    return finalObject;
  })
}

export async function insertValuesToDynamoDb(tableName: string, itemArray: PutRequest[]) {
  const command = new BatchWriteItemCommand({
    RequestItems: {
      [tableName]: itemArray.map(e => ({ PutRequest: e }))
    }
  })

  return await dynamoClient.send(command);
}

export async function waitForTableDeletion(tableName: string) {
  return await waitUntilTableNotExists(
    { client: dynamoClient, maxWaitTime: 200, minDelay: 1, maxDelay: 5 },
    { TableName: tableName }
  )
}

export async function waitForTableCreation(tableName: string) {
  return await waitUntilTableExists(
    { client: dynamoClient, maxWaitTime: 200, minDelay: 1, maxDelay: 5 },
    { TableName: tableName }
  )
}