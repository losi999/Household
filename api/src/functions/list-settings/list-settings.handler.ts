
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListSettingsService } from '@household/api/functions/list-settings/list-settings.service';
import { Responses } from '@household/shared/types/responses';

export default (listSettings: IListSettingsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let settings: Responses.Setting[];
    try {
      settings = await listSettings();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(settings);
  };
};
