import { IBulkTransactionImporterService } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';

export default (bulkTransactionImporter: IBulkTransactionImporterService): AWSLambda.S3Handler =>
  async (event) => {
    await bulkTransactionImporter({
      bucketName: event.Records[0].s3.bucket.name,
      fileName: event.Records[0].s3.object.key,
    });
  };
