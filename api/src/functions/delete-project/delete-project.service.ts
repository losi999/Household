import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectService } from '@household/shared/services/project-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteProjectService {
  (ctx: Api.Project.ProjectId): Promise<unknown>;
}

export const deleteProjectServiceFactory = (
  projectService: IProjectService): IDeleteProjectService => {
  return ({ projectId }) => {
    return projectService.deleteProject(projectId).catch(httpErrors.project.delete({
      projectId,
    }));
  };
};
