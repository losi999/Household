
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListProjectsService } from '@household/api/functions/list-projects/list-projects.service';
import { Responses } from '@household/shared/types/responses';

export default (listProjects: IListProjectsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let projects: Responses.Project[];
    try {
      projects = await listProjects();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(projects);
  };
};
