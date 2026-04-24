import { getProjectId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Project } from '@household/shared/types/types';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';
import { Comparer } from '@household/test/comparer';

type ProjectApiFixture ={
  requestGetProject(projectId: Project.Id): Promise<APIResponse>;
  requestListProjects(): Promise<APIResponse>;
  requestCreateProject(project: Project.Request): Promise<APIResponse>;
  requestUpdateProject(projectId: Project.Id, project: Project.Request): Promise<APIResponse>;
  requestDeleteProject(projectId: Project.Id): Promise<APIResponse>;
  requestMergeProjects(projectId: Project.Id, sourceProjectIds: Project.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<ProjectApiFixture>({
  requestGetProject: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetProject = async (projectId: Project.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetProject);
  },
  requestListProjects: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListProjects = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/project/v1/projects`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListProjects);
  },
  requestCreateProject: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProject = async (project: Project.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/project/v1/projects`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: project,
      });
    };

    await use(requestCreateProject);
  },
  requestUpdateProject: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateProject = async (projectId: Project.Id, project: Project.Request) => {
      return loggedRequest.put(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: project,
      });
    };

    await use(requestUpdateProject);
  },
  requestDeleteProject: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteProject = async (projectId: Project.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteProject);
  },
  requestMergeProjects: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeProjects = async (projectId: Project.Id, sourceProjectIds: Project.Id[]) => {
      return loggedRequest.post(`${process.env.BASE_URL}/project/v1/projects/${projectId}/merge`, {
        headers: {
          Authorization: authToken,
        },
        data: sourceProjectIds,
      });
    };

    await use(requestMergeProjects);  
  },
});

export const validateProjectResponse = (response: Project.Response, document: Project.Document) => {
  return new Comparer(response, {
    projectId: getProjectId(document),
    name: document?.name,
    description: document?.description,
  });
};

export const expect = baseExpect.extend({
  async toHaveBeenSavedAsProjectDocument(req: Project.Request, document: Project.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected project to be stored in database, but it was not found',
      };
    }

    const comparer = new Comparer(document, {
      name: req.name,
      description: req.description,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected project to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Project.Document) {
    return {
      pass: !document,
      message: () => `Expected project to be deleted from database, but it was found with id ${getProjectId(document)}`,
    };
  },
  async toMatchProjectDocument(received: APIResponse, document: Project.Document) {
    const response = await received.json() as Project.Response;
    
    const errors = validateProjectResponse(response, document).validate();
      
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match project document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingProjectDocument(received: APIResponse, document: Project.Document) {
    const response = await received.json() as Project.Response[];

    const matchingResponse = response.find(r => r.projectId === getProjectId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a project with id ${getProjectId(document)}, but it was not found`,
      };
    }

    const errors = validateProjectResponse(matchingResponse, document).validate();
      
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match project document, but it did not:\n${errors.join('\n')}`,
    };
  }, 

});
