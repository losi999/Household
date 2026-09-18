import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateProjectService {
  (ctx: {
    body: Requests.Project;
    projectId: Api.Project.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter,
): IUpdateProjectService => {
  return async ({ body, projectId, expiresIn }) => {
    const queried = await projectService.findProjectById(projectId).catch(httpErrors.project.getById({
      projectId,
    }));

    httpErrors.project.notFound({
      project: queried,
      projectId,
    });

    const update = projectDocumentConverter.update(body, expiresIn);

    return projectService.updateProject(projectId, update).catch(httpErrors.project.update({
      projectId,
      update,
    }));
  };
};
