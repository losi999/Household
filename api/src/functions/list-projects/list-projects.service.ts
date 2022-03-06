import { httpError } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Project } from '@household/shared/types/types';

export interface IListProjectsService {
  (): Promise<Project.Response[]>;
}

export const listProjectsServiceFactory = (
  databaseService: IDatabaseService,
  projectDocumentConverter: IProjectDocumentConverter): IListProjectsService => {
  return async () => {

    const documents = await databaseService.listProjects().catch((error) => {
      console.error('List projects', error);
      throw httpError(500, 'Error while listing projects');
    });

    return projectDocumentConverter.toResponseList(documents);
  };
};
