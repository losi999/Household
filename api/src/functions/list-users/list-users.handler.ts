import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListUsersService } from '@household/api/functions/list-users/list-users.service';
import { Responses } from '@household/shared/types/responses';

export default (listUsers: IListUsersService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let users: Responses.User[];
    try {
      users = await listUsers();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(users);
  };
};
