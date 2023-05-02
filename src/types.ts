declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly BUCKET_NAME: string,
      readonly S3_ACCESS_KEY_ID: string,
      readonly S3_SECRET_ACCESS_KEY: string,
      readonly S3_REGION: string,
    }
  }
}

export type CsvFile = string;