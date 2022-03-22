import { httpError } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface ICreateProjectService {
  (ctx: {
    body: Project.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter): ICreateProjectService => {
  return async ({ body, expiresIn }) => {
    const document = projectDocumentConverter.create(body, expiresIn);

    const saved = await projectService.saveProject(document).catch((error) => {
      console.error('Save project', error);
      throw httpError(500, 'Error while saving project');
    });

    return saved._id.toString();
  };
};
