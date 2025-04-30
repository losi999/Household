import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IUpdateSettingService } from '@household/api/functions/update-setting/update-setting.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateSetting: IUpdateSettingService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { settingKey } = castPathParameters(event);

    try {
      await updateSetting({
        ...body,
        settingKey,
        expiresIn: Number(getExpiresInHeader(event)),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
