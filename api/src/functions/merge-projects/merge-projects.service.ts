import { httpErrors } from '@household/api/common/error-handlers';
import { IProjectService } from '@household/shared/services/project-service';
import { Project } from '@household/shared/types/types';

export interface IMergeProjectsService {
  (ctx: {
    body: Project.Id[];
  } & Project.ProjectId): Promise<void>;
}

export const mergeProjectsServiceFactory = (
  projectService: IProjectService,
): IMergeProjectsService => {
  return async ({ body, projectId }) => {
    httpErrors.project.mergeTargetAmongSource(body.includes(projectId), {
      projectId,
      source: body,
    });

    const projectIds = [
      projectId,
      ...new Set(body),
    ];

    const projects = await projectService.listProjectsByIds(projectIds).catch(httpErrors.project.listByIds(projectIds));

    httpErrors.project.multipleNotFound(projects.length !== projectIds.length, {
      projectIds,
    });

    await projectService.mergeProjects({
      sourceProjectIds: body,
      targetProjectId: projectId,
    }).catch(httpErrors.project.merge({
      sourceProjectIds: body,
      targetProjectId: projectId,
    }));
  };
};
