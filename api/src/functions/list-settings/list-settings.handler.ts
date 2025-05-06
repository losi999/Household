
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListSettingsService } from '@household/api/functions/list-settings/list-settings.service';
import { Setting } from '@household/shared/types/types';

export default (listSettings: IListSettingsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let settings: Setting.Response[];
    try {
      settings = await listSettings();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(settings);
  };
};
