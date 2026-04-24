import { projectService } from '@household/shared/dependencies/services/project-service';
import { IProjectService } from '@household/shared/services/project-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IProjectService, 'saveProject' | 'saveProjects' | 'findProjectById'>>({
  saveProject: async ({ logServiceCall }, use) => {
    const saveProject: IProjectService['saveProject'] = async (project) => {
      const result = await projectService.saveProject(project);
      await logServiceCall('saveProject', {
        project,
      }, result);
      return result;
    };

    await use(saveProject);
  },
  saveProjects: async ({ logServiceCall }, use) => {
    const saveProjects: IProjectService['saveProjects'] = async (...projects) => {
      const result = await projectService.saveProjects(...projects);
      await logServiceCall('saveProjects', {
        projects,
      }, result);
      return result;
    };

    await use(saveProjects);
  },
  findProjectById: async ({ logServiceCall }, use) => {
    const findProjectById: IProjectService['findProjectById'] = async (projectId) => {
      const result = await projectService.findProjectById(projectId);
      await logServiceCall('findProjectById', {
        projectId,
      }, result);
      return result;
    };

    await use(findProjectById);
  },
});
