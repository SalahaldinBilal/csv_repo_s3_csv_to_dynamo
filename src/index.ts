import * as dotenv from 'dotenv'
dotenv.config();
import type { S3Handler } from 'aws-lambda';
import { Logger } from './logger';
import { ResourceInUseException } from '@aws-sdk/client-dynamodb';
import {
  createDynamoTable,
  deleteDynamoTable,
  insertValuesToDynamoDb,
  s3JsonToDynamoDbItem,
  s3LoadFileContentsAsJson,
  waitForTableCreation,
  waitForTableDeletion
} from './helpers';

export const handler: S3Handler = async (event) => {
  try {
    const fileObject = event.Records[0].s3.object;
    const bucketName = event.Records[0].s3.bucket.name;
    const fileName = fileObject.key;
    const tableName = `salah_csv_repo_${fileName.replace(/[^a-zA-Z0-9_.-]/gm, "_")}`;
    const logger = new Logger(fileName);

    logger.log("Reading file as JSON object.");
    const json = await s3LoadFileContentsAsJson(fileName, bucketName);
    logger.log("JSON result: ", json);

    if (!json.length) return logger.log("No items to enter, existing....")

    logger.log("Converting csv JSON to DynamoDB items.");
    const items = s3JsonToDynamoDbItem(json);
    logger.log("Conversion result: ", items);

    try {
      logger.log("Creating DynamoDB table.");
      const creationResult = await createDynamoTable(tableName);
      logger.log("Creation result: ", JSON.stringify(creationResult, null, 2));
      logger.log("Waiting for table to be fully created.");
      await waitForTableCreation(tableName);
    } catch (e) {
      if (e instanceof ResourceInUseException) {
        logger.log("Table already exists");
        logger.log("Deleting table");
        await deleteDynamoTable(tableName);

        logger.log("Waiting for old table to be deleted");
        await waitForTableDeletion(tableName);

        logger.log("Creating new table");
        const creationResult = await createDynamoTable(tableName);
        logger.log("Creation result: ", JSON.stringify(creationResult, null, 2));

        logger.log("Waiting for table to be fully created.");
        await waitForTableCreation(tableName);
      } else throw e;
    }

    logger.log("Inserting values to DynamoDB.");
    const insertionResult = await insertValuesToDynamoDb(tableName, items);
    logger.log("Insertion result: ", insertionResult);
  } catch (error) {
    console.error(error);
    Logger.getLastLog();
  }
};