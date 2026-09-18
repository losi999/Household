import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectService } from '@household/shared/services/project-service';
import { Api } from '@household/shared/types/api';

export interface IMergeProjectsService {
  (ctx: {
    body: Api.Project.Id[];
  } & Api.Project.ProjectId): Promise<unknown>;
}

export const mergeProjectsServiceFactory = (
  projectService: IProjectService,
): IMergeProjectsService => {
  return async ({ body, projectId }) => {
    httpErrors.project.mergeTargetAmongSource({
      target: projectId,
      source: body,
    });

    const projectIds = [
      projectId,
      ...new Set(body),
    ];

    const projects = await projectService.findProjectsByIds(projectIds).catch(httpErrors.project.listByIds(projectIds));

    httpErrors.project.multipleNotFound({
      projects,
      projectIds,
    });

    return projectService.mergeProjects({
      sourceProjectIds: body,
      targetProjectId: projectId,
    }).catch(httpErrors.project.merge({
      sourceProjectIds: body,
      targetProjectId: projectId,
    }));
  };
};
