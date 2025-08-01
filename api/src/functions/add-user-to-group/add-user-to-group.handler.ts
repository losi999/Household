
import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IAddUserToGroup } from '@household/api/functions/add-user-to-group/add-user-to-group.service';
import { UserType } from '@household/shared/enums';

export default (addUserToGroup: IAddUserToGroup): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const { email, group } = event.pathParameters;
    try {
      await addUserToGroup({
        email,
        group: group as UserType,
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
