
import { ICreateTestUsersService } from '@household/api/functions/create-test-users/create-test-users.service';

export default (createTestUsers: ICreateTestUsersService): AWSLambda.Handler =>
  async () => {
    await createTestUsers();
  };
