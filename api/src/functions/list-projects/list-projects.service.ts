import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IListProjectsService {
  (): Promise<Project.Response[]>;
}

export const listProjectsServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter): IListProjectsService => {
  return async () => {

    const documents = await projectService.listProjects().catch(httpErrors.project.list());

    return projectDocumentConverter.toResponseList(documents);
  };
};
