
import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IRemoveUserFromGroup } from '@household/api/functions/remove-user-from-group/remove-user-from-group.service';
import { UserType } from '@household/shared/enums';

export default (removeUserFromGroup: IRemoveUserFromGroup): AWSLambda.APIGatewayProxyHandler =>
  async (event) => {
    const { email, group } = event.pathParameters;
    try {
      await removeUserFromGroup({
        email,
        group: group as UserType,
      });

    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
