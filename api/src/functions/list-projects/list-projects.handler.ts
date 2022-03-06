
import { errorResponse, okResponse } from '@household/api/common/response-factory';
import { IListProjectsService } from '@household/api/functions/list-projects/list-projects.service';
import { Project } from '@household/shared/types/types';

export default (listProjects: IListProjectsService): AWSLambda.APIGatewayProxyHandler => {
  return async () => {
    let projects: Project.Response[];
    try {
      projects = await listProjects();
    } catch (error) {
      console.error(error);
      return errorResponse(error);
    }

    return okResponse(projects);
  };
};
