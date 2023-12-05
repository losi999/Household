import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IDeleteProjectService {
  (ctx: {
    projectId: Project.Id;
  }): Promise<void>;
}

export const deleteProjectServiceFactory = (
  projectService: IProjectService): IDeleteProjectService => {
  return async ({ projectId }) => {
    await projectService.deleteProject(projectId).catch(httpErrors.project.delete({
      projectId,
    }));
  };
};
