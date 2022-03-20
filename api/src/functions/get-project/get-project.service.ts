import { httpError } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Project } from '@household/shared/types/types';

export interface IGetProjectService {
  (ctx: {
    projectId: Project.IdType;
  }): Promise<Project.Response>;
}

export const getProjectServiceFactory = (
  databaseService: IDatabaseService,
  projectDocumentConverter: IProjectDocumentConverter): IGetProjectService => {
  return async ({ projectId }) => {

    const document = await databaseService.getProjectById(projectId).catch((error) => {
      console.error('Get project', error);
      throw httpError(500, 'Error while getting project');
    });

    if (!document) {
      throw httpError(404, 'No project found');
    }

    return projectDocumentConverter.toResponse(document);
  };
};
