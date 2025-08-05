import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IUpdateProjectService {
  (ctx: {
    body: Project.Request;
    projectId: Project.Id;
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
