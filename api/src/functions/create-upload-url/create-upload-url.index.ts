import { createUploadUrlServiceFactory } from '@household/api/functions/create-upload-url/create-upload-url.service';
import { default as handler } from '@household/api/functions/create-upload-url/create-upload-url.handler';
import { importStorageService } from '@household/shared/dependencies/services/storage-service';
import { default as index } from '@household/api/handlers/index.handler';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { default as body } from '@household/shared/schemas/file-request';
import { fileService } from '@household/shared/dependencies/services/file-service';
import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';

const createUploadUrlService = createUploadUrlServiceFactory(fileService, fileDocumentConverter, importStorageService);

export default index({
  handler: handler(createUploadUrlService),
  before: [
    apiRequestValidator({
      body,
    }),
  ],
  after: [cors],
});
