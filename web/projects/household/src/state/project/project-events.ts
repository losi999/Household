
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';

export const projectEvents = eventGroup({
  source: 'Project',
  events: {
    createProject: type<void>(),
    updateProject: type<Api.Project.ProjectId & Responses.Project>(),
    deleteProject: type<Responses.Project>(),
    mergeProjects: type<Responses.Project>(),
    openProjectListItemSubmenu: type<Responses.Project>(),
  },
});

export const projectApiEvents = eventGroup({
  source: 'Project API',
  events: {
    listProjectsInitiated: type<void>(),
    listProjectsCompleted: type<Responses.Project[]>(),
    createProjectInitiated: type<Requests.Project>(),
    createProjectCompleted: type<Api.Project.ProjectId & Requests.Project>(),
    updateProjectInitiated: type<Api.Project.ProjectId & Requests.Project>(),
    updateProjectCompleted: type<Api.Project.ProjectId & Requests.Project>(),
    updateProjectFailed: type<Api.Project.ProjectId>(),
    deleteProjectInitiated: type<Api.Project.ProjectId>(),
    deleteProjectCompleted: type<Api.Project.ProjectId>(),
    deleteProjectFailed: type<Api.Project.ProjectId>(),
    mergeProjectsInitiated: type<{
      sourceProjectIds: Api.Project.Id[];
      targetProjectId: Api.Project.Id;
    }>(),
    mergeProjectsCompleted: type<{
      sourceProjectIds: Api.Project.Id[];
    }>(),
    mergeProjectsFailed: type<{
      sourceProjectIds: Api.Project.Id[];
    }>(),
  },
});

