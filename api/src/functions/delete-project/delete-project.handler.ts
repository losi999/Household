import { errorResponse, noContentResponse } from '@household/api/common/response-factory';
import { IDeleteProjectService } from '@household/api/functions/delete-project/delete-project.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (deleteProject: IDeleteProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { projectId } = castPathParameters(event);

    try {
      await deleteProject({
        projectId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return noContentResponse();
  };
};
