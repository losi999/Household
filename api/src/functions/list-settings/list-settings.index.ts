import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { default as handler } from '@household/api/functions/list-settings/list-settings.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { listSettingsServiceFactory } from '@household/api/functions/list-settings/list-settings.service';
import { settingService } from '@household/shared/dependencies/services/setting-service';
import { default as index } from '@household/api/handlers/index.handler';

const listSettingsService = listSettingsServiceFactory(settingService, settingDocumentConverter);

export default index({
  handler: handler(listSettingsService),
  before: [],
  after: [cors],
});
