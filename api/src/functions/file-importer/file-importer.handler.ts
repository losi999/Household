import { IFileImporterService } from '@household/api/functions/file-importer/file-importer.service';

export default (fileImporter: IFileImporterService): AWSLambda.S3Handler =>
  async (event) => {
    console.log(JSON.stringify(event, null, 2));

    await fileImporter({
      bucketName: event.Records[0].s3.bucket.name,
      fileName: event.Records[0].s3.object.key,
    });
  };
