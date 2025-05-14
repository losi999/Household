import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { default as handler } from '@household/api/functions/list-recipients/list-recipients.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listRecipientsServiceFactory } from '@household/api/functions/list-recipients/list-recipients.service';
import { recipientService } from '@household/shared/dependencies/services/recipient-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const listRecipientsService = listRecipientsServiceFactory(recipientService, recipientDocumentConverter);

export default index({
  handler: handler(listRecipientsService),
  before: [authorizer(UserType.Editor, UserType.Viewer)],
  after: [cors],
});
