import { config, S3 } from 'aws-sdk';

config.logger = console;
export const s3 = new S3();