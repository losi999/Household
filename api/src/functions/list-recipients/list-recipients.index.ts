import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { databaseService } from '@household/shared/dependencies/services/database-service';
import { default as handler } from '@household/api/functions/list-recipients/list-recipients.handler';
import { cors } from '@household/api/dependencies/handlers/cors-handler';
import { listRecipientsServiceFactory } from '@household/api/functions/list-recipients/list-recipients.service';

const listRecipientsService = listRecipientsServiceFactory(databaseService, recipientDocumentConverter);

export default cors(/*authorizer('admin')*/(handler(listRecipientsService)));
