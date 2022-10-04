import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IUpdateProjectService {
  (ctx: {
    body: Project.Request;
    projectId: Project.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter,
): IUpdateProjectService => {
  return async ({ body, projectId, expiresIn }) => {
    const queried = await projectService.getProjectById(projectId).catch(httpErrors.project.getById({
      projectId,
    }));

    httpErrors.project.notFound(!queried, {
      projectId,
    });

    const { updatedAt, ...document } = queried;

    const updated = projectDocumentConverter.update({
      document,
      body,
    }, expiresIn);

    await projectService.updateProject(updated).catch(httpErrors.project.update(updated));
  };
};
