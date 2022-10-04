import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IUpdateProjectService } from '@household/api/functions/update-project/update-project.service';
import { castPathParameters, getExpiresInHeader } from '@household/shared/common/aws-utils';

export default (updateProject: IUpdateProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { projectId } = castPathParameters(event);

    try {
      await updateProject({
        projectId,
        body,
        expiresIn: Number(getExpiresInHeader(event)),
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
