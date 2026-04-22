import { projectService } from '@household/shared/dependencies/services/project-service';
import { IProjectService } from '@household/shared/services/project-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IProjectService, 'saveProject' | 'saveProjects' | 'findProjectById'>>({
  saveProject: async ({ logDbCall }, use) => {
    const saveProject: IProjectService['saveProject'] = async (project) => {
      const result = await projectService.saveProject(project);
      await logDbCall('saveProject', {
        project,
      }, result);
      return result;
    };

    await use(saveProject);
  },
  saveProjects: async ({ logDbCall }, use) => {
    const saveProjects: IProjectService['saveProjects'] = async (...projects) => {
      const result = await projectService.saveProjects(...projects);
      await logDbCall('saveProjects', {
        projects,
      }, result);
      return result;
    };

    await use(saveProjects);
  },
  findProjectById: async ({ logDbCall }, use) => {
    const findProjectById: IProjectService['findProjectById'] = async (projectId) => {
      const result = await projectService.findProjectById(projectId);
      await logDbCall('findProjectById', {
        projectId,
      }, result);
      return result;
    };

    await use(findProjectById);
  },
});
