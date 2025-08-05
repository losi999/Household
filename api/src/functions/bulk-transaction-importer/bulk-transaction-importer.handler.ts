import { IBulkTransactionImporterService } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';
import { File } from '@household/shared/types/types';

export default (bulkTransactionImporter: IBulkTransactionImporterService): AWSLambda.S3Handler =>
  async (event) => {
    try {
      await bulkTransactionImporter({
        bucketName: event.Records[0].s3.bucket.name,
        fileId: event.Records[0].s3.object.key as File.Id,
      });
    } catch (error) {
      console.log(error);
    }
  };
