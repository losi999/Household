import { httpError } from '@household/shared/common/utils';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IDeleteProjectService {
  (ctx: {
    projectId: Project.IdType;
  }): Promise<void>;
}

export const deleteProjectServiceFactory = (
  projectService: IProjectService): IDeleteProjectService => {
  return async ({ projectId }) => {
    await projectService.deleteProject(projectId).catch((error) => {
      console.error('Delete project', error);
      throw httpError(500, 'Error while deleting project');
    });
  };
};
