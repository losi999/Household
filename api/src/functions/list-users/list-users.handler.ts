import { errorResponse } from '@household/api/common/response-factory';
import { IListUsersService } from '@household/api/functions/list-users/list-users.service';
import { User } from '@household/shared/types/types';

export default (listUsers: IListUsersService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let users: User.Response[];
    try {
      users = await listUsers();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  };
};
