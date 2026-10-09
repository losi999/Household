import { projectApiEvents } from '@household/state/project/project-events';
import { ProjectState } from '@household/state/project/project-store';
import { toSearchTerms } from '@household/shared/common/utils';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withProjectReducer = () => {
  return signalStoreFeature(
    withReducer<ProjectState>(
      on(projectApiEvents.listProjectsCompleted, ({ payload }) => {
        return {
          projectList: payload.map(p => {
            return {
              ...p,
              searchTerms: toSearchTerms(p.name),
            };
          }),
        };
      }),
      on(projectApiEvents.updateProjectInitiated, projectApiEvents.deleteProjectInitiated, ({ payload: { projectId } }) => {
        return (state) => {
          return {
            isInProgress: [
              ...state.isInProgress,
              projectId,
            ],
          };
        };
      }),
      on(projectApiEvents.updateProjectCompleted, projectApiEvents.deleteProjectCompleted, projectApiEvents.updateProjectFailed, projectApiEvents.deleteProjectFailed, ({ payload: { projectId } }) => {
        return (state) => {
          return {
            isInProgress: state.isInProgress.filter(id => id !== projectId),
          };
        };
      }),
      on(projectApiEvents.createProjectCompleted, projectApiEvents.updateProjectCompleted, ({ payload: { projectId, name, description } }) => {
        return (state) => {
          return {
            projectList: state.projectList.filter(p => p.projectId !== projectId)
              .concat({
                projectId,
                name,
                description,
                searchTerms: toSearchTerms(name),
              })
              .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
                sensitivity: 'base',
              })),
          };
        };
      }),
      on(projectApiEvents.deleteProjectCompleted, ({ payload: { projectId } }) => {
        return (state) => {
          return {
            projectList: state.projectList.filter(p => p.projectId !== projectId),
          };
        };
      }),
      on(projectApiEvents.mergeProjectsInitiated, ({ payload: { sourceProjectIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: sourceProjectIds,
          };
        };
      }),
      on(projectApiEvents.mergeProjectsCompleted, projectApiEvents.mergeProjectsFailed, ({ payload: { sourceProjectIds } }) => {
        return (state) => {
          return {
            ...state,
            isInProgress: state.isInProgress.filter(p => !sourceProjectIds.includes(p)),
          };
        };
      }),
      on(projectApiEvents.mergeProjectsCompleted, ({ payload: { sourceProjectIds } }) => {
        return (state) => {
          return {
            ...state,
            projectList: state.projectList.filter(p => !sourceProjectIds.includes(p.projectId)),
          };
        };
      }),
    ),
  );
};
