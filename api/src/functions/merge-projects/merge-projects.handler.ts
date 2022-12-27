import { errorResponse, createdResponse } from '@household/api/common/response-factory';
import { IMergeProjectsService } from '@household/api/functions/merge-projects/merge-projects.service';
import { castPathParameters } from '@household/shared/common/aws-utils';

export default (mergeProjects: IMergeProjectsService): AWSLambda.APIGatewayProxyHandler => {
  return async (event) => {
    const body = JSON.parse(event.body);
    const { projectId } = castPathParameters(event);

    try {
      await mergeProjects({
        projectId,
        body,
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
