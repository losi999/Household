import { default as handler } from '@household/api/functions/delete-file/delete-file.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { deleteFileServiceFactory } from '@household/api/functions/delete-file/delete-file.service';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { default as pathParameters } from '@household/shared/schemas/file-id';
import { fileService } from '@household/shared/dependencies/services/file-service';
import { default as index } from '@household/api/handlers/index.handler';
import { storageService } from '@household/shared/dependencies/services/storage-service';

const deleteFileService = deleteFileServiceFactory(fileService, storageService);

export default index({
  handler: handler(deleteFileService),
  before: [
    apiRequestValidator({
      pathParameters,
    }),
  ],
  after: [cors],
});
