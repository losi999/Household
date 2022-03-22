import { httpError } from '@household/shared/common/utils';
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
    const { updatedAt, ...document } = await projectService.getProjectById(projectId).catch((error) => {
      console.error('Get project', error);
      throw httpError(500, 'Error while getting project');
    });

    if (!document) {
      throw httpError(404, 'No project found');
    }

    const updated = projectDocumentConverter.update({
      document,
      body, 
    }, expiresIn);

    await projectService.updateProject(updated).catch((error) => {
      console.error('Update project', error);
      throw httpError(500, 'Error while updating project');
    });
  };
};
