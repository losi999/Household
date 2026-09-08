import { httpErrors } from '@household/api/common/error-handlers';
import { getProjectId } from '@household/shared/common/utils';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { IProjectService } from '@household/shared/services/project-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface ICreateProjectService {
  (ctx: {
    body: Requests.Project;
    expiresIn: number;
  }): Promise<Api.Project.Id>;
}

export const createProjectServiceFactory = (
  projectService: IProjectService,
  projectDocumentConverter: IProjectDocumentConverter): ICreateProjectService => {
  return async ({ body, expiresIn }) => {
    const document = projectDocumentConverter.create(body, expiresIn);

    const saved = await projectService.saveProject(document).catch(httpErrors.project.save(document));

    return getProjectId(saved);
  };
};
