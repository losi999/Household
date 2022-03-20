import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { ICreateProjectService } from '@household/api/functions/create-project/create-project.service';
import { headerExpiresIn } from '@household/shared/constants';

export default (createProject: ICreateProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);

    let projectId: string;
    try {
      projectId = await createProject({
        body,
        expiresIn: Number(event.headers[headerExpiresIn]),
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return createdResponse({
      projectId,
    });
  };
};
