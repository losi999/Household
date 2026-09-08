import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IGetProjectService {
  (ctx: {
    projectId: Api.Project.Id;
  }): Promise<Responses.Project>;
}

export const getProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter): IGetProjectService => {
  return async ({ projectId }) => {
    const project = await projectService.findProjectById(projectId).catch(httpErrors.project.getById({
      projectId,
    }));

    httpErrors.project.notFound({
      project,
      projectId,
    });

    return projectDocumentConverter.toResponse(project);
  };
};
