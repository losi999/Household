import { default as handler } from '@household/api/functions/update-setting/update-setting.handler';
import { cors } from '@household/api/dependencies/handlers/cors.handler';
import { updateSettingServiceFactory } from '@household/api/functions/update-setting/update-setting.service';
import { settingDocumentConverter } from '@household/shared/dependencies/converters/setting-document-converter';
import { default as pathParameters } from '@household/shared/schemas/setting-key';
import { default as body } from '@household/shared/schemas/setting-request';
import { apiRequestValidator } from '@household/api/dependencies/handlers/api-request-validator.handler';
import { settingService } from '@household/shared/dependencies/services/setting-service';
import { default as index } from '@household/api/handlers/index.handler';
import { authorizer } from '@household/api/dependencies/handlers/authorizer.handler';
import { UserType } from '@household/shared/enums';

const updateSettingsService = updateSettingServiceFactory(settingService, settingDocumentConverter);

export default index({
  handler: handler(updateSettingsService),
  before: [
    authorizer(UserType.Editor),
    apiRequestValidator({
      body,
      pathParameters,
    }),
  ],
  after: [cors],
});
