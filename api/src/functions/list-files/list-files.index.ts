import { fileDocumentConverter } from '@household/shared/dependencies/converters/file-document-converter';
import { default as handler } from '@household/api/functions/list-files/list-files.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listFilesServiceFactory } from '@household/api/functions/list-files/list-files.service';
import { fileService } from '@household/shared/dependencies/services/file-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listFilesService = listFilesServiceFactory(fileService, fileDocumentConverter);

export default index({
  handler: handler(listFilesService),
  before: [authorizer(UserType.Editor)],
  after: [cors],
});
