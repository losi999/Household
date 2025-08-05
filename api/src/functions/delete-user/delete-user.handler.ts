
import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteUserService } from '@household/api/functions/delete-user/delete-user.service';

export default (deleteUser: IDeleteUserService): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const { email } = event.pathParameters;
    try {
      await deleteUser({
        email,
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
