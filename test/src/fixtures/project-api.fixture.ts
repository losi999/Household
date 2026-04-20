import { getProjectId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Project } from '@household/shared/types/types';
import { createComparer as cc } from '@household/test/utils';
import { test as baseTest } from '@household/test/fixtures/api.fixture';
import { expect as baseExpect, APIResponse } from '@playwright/test';
import { createComparer2 } from '@household/test/comparer';
import { createComparer } from '@household/test/comparer3';

type ProjectApiFixture ={
  requestGetProject(projectId: Project.Id): Promise<APIResponse>;
  requestListProjects(): Promise<APIResponse>;
  requestCreateProject(project: Project.Request): Promise<APIResponse>;
  requestUpdateProject(projectId: Project.Id, project: Project.Request): Promise<APIResponse>;
  requestDeleteProject(projectId: Project.Id): Promise<APIResponse>;
  requestMergeProjects(projectId: Project.Id, sourceProjectIds: Project.Id[]): Promise<APIResponse>;
};

export const test = baseTest.extend<ProjectApiFixture>({
  requestGetProject: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetProject = async (projectId: Project.Id) => {
      return request.get(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetProject);
  },
  requestListProjects: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListProjects = async () => {
      return request.get(`${process.env.BASE_URL}/project/v1/projects`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListProjects);
  },
  requestCreateProject: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateProject = async (project: Project.Request) => {
      return request.post(`${process.env.BASE_URL}/project/v1/projects`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: project,
      });
    };

    await use(requestCreateProject);
  },
  requestUpdateProject: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateProject = async (projectId: Project.Id, project: Project.Request) => {
      return request.put(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: project,
      });
    };

    await use(requestUpdateProject);
  },
  requestDeleteProject: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteProject = async (projectId: Project.Id) => {
      return request.delete(`${process.env.BASE_URL}/project/v1/projects/${projectId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteProject);
  },
  requestMergeProjects: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestMergeProjects = async (projectId: Project.Id, sourceProjectIds: Project.Id[]) => {
      return request.post(`${process.env.BASE_URL}/project/v1/projects/${projectId}/merge`, {
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
  return createComparer2({
    actual: response,
    factory: (actual, compare) => {
      return {
        projectId: compare(actual.projectId, getProjectId(document)),
        // name: compare(actual.name, document.name),
        description: compare(actual.description, document.description),
      };
    },
  });
};

export const expect = baseExpect.extend({
  async toBeStoredInDatabase(req: Project.Request, document: Project.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected project to be stored in database, but it was not found',
      };
    }

    const comp = createComparer(document, {
      name: req.name,
      description: req.description,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    comp.validate();

    const comparer = createComparer2({
      actual: document,
      internalProperties: [
        '_id',
        'createdAt',
        'expiresAt',
        'updatedAt',
      ],
      factory: (actual, compare) => {
        return {
          name: compare(actual.name, req.name),
          description: compare(actual.description, req.description),
        };
      },
    });
    try {
      comparer.validate();

      return {
        pass: true,
        message: () => '',
      };
    } catch (error) {
      return {
        pass: false,
        message: () => error,
      };  
    }
  },
  toHaveBeenDeletedFromDatabase(document: Project.Document) {
    return {
      pass: !document,
      message: () => `expected project to be deleted from database, but it was found with id ${getProjectId(document)}`,
    };
  },
  async toMatchProjectDocument(received: APIResponse, document: Project.Document) {
    const response = await received.json() as Project.Response;

    try {
      validateProjectResponse(response, document).validate();
      
      return {
        pass: true,
        message: () => '',
      };

    } catch (error) {
      return {
        pass: false,
        message: () => error,
      };
    }
  },
  async toContainMatchingProjectDocument(received: APIResponse, document: Project.Document) {
    const response = await received.json() as Project.Response[];

    const matchingResponse = response.find(r => r.projectId === getProjectId(document));

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a project with id ${getProjectId(document)}, but it was not found`,
      };
    }

    try {
      validateProjectResponse(matchingResponse, document).validate();
      
      return {
        pass: true,
        message: () => '',
      };
      
    } catch (error) {
      return {
        pass: false,
        message: () => error,
      };
    }
  }, 

});
