import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IGetProjectService } from '@household/api/functions/get-project/get-project.service';
import { castPathParameters } from '@household/shared/common/utils';
import { Project } from '@household/shared/types/types';

export default (getProject: IGetProjectService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const { projectId } = castPathParameters(event);

    let project: Project.Response;
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
