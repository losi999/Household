import { IBulkTransactionImporterService } from '@household/api/functions/bulk-transaction-importer/bulk-transaction-importer.service';
import { File } from '@household/shared/types/types';

export default (bulkTransactionImporter: IBulkTransactionImporterService): AWSLambda.S3Handler =>
  async (event) => {
    await bulkTransactionImporter({
      fileId: event.Records[0].s3.object.key as File.Id,
    });
  };
