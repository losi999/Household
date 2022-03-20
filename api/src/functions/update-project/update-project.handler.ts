import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateProjectService } from '@household/api/functions/update-project/update-project.service';
import { castPathParameters } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';

export default (updateProject: IUpdateProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { projectId } = castPathParameters(event);

    try {
      await updateProject({
        projectId,
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
