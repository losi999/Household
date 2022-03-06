import { httpError } from '@household/shared/common/utils';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Project } from '@household/shared/types/types';

export interface IDeleteProjectService {
  (ctx: {
    projectId: Project.IdType;
  }): Promise<void>;
}

export const deleteProjectServiceFactory = (
  databaseService: IDatabaseService): IDeleteProjectService => {
  return async ({ projectId }) => {
    await databaseService.deleteProject(projectId).catch((error) => {
      console.error('Delete project', error);
      throw httpError(500, 'Error while deleting project');
    });
  };
};
