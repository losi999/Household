import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IGetProjectService {
  (ctx: {
    projectId: Project.IdType;
  }): Promise<Project.Response>;
}

export const getProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter): IGetProjectService => {
  return async ({ projectId }) => {

    const document = await projectService.getProjectById(projectId).catch(httpErrors.project.getById({
      projectId,
    }));

    httpErrors.project.notFound(!document, {
      projectId,
    });

    return projectDocumentConverter.toResponse(document);
  };
};
