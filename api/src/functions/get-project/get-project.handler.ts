import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetProjectService } from '@household/api/functions/get-project/get-project.service';
import { castPathParameters } from '@household/shared/common/aws-utils';
import { Responses } from '@household/shared/types/responses';

export default (getProject: IGetProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { projectId } = castPathParameters(event);

    let project: Responses.Project;
    try {
      project = await getProject({
        projectId,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(project);
  };
};
