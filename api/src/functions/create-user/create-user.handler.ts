
import { createdResponse, errorResponse } from '@household/api/common/response-factory';
import { ICreateUserService } from '@household/api/functions/create-user/create-user.service';
import { getSuppressEmailHeader } from '@household/shared/common/aws-utils';

export default (createUser: ICreateUserService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const body = JSON.parse(event.body);
    const suppressEmail = getSuppressEmailHeader(event);

    try {
      await createUser({
        body,
        suppressEmail: suppressEmail && suppressEmail.toLowerCase() !== 'false',
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse();
  };
