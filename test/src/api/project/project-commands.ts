import { Project } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IProjectService } from '@household/shared/services/project-service';

const projectTask = <T extends keyof IProjectService>(name: T, params: Parameters<IProjectService[T]>) => {
  return cy.task(name, ...params);
};

const requestCreateProject = (idToken: string, project: Project.Request) => {
  return cy.request({
    body: project,
    method: 'POST',
    url: '/project/v1/projects',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateProject = (idToken: string, projectId: Project.IdType, project: Project.Request) => {
  return cy.request({
    body: project,
    method: 'PUT',
    url: `/project/v1/projects/${projectId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteProject = (idToken: string, projectId: Project.IdType) => {
  return cy.request({
    method: 'DELETE',
    url: `/project/v1/projects/${projectId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetProject = (idToken: string, projectId: Project.IdType) => {
  return cy.request({
    method: 'GET',
    url: `/project/v1/projects/${projectId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetProjectList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/project/v1/projects',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const validateProjectDocument = (response: Project.Id, request: Project.Request) => {
  const id = response?.projectId;

  cy.log('Get project document', id)
    .projectTask('getProjectById', [id])
    .should((document: Project.Document) => {
      expect(document._id.toString()).to.equal(id);
      expect(document.name).to.equal(request.name);
      expect(document.description).to.equal(request.description);
    });
};

const validateProjectResponse = (response: Project.Response, document: Project.Document) => {
  expect(response.projectId).to.equal(document._id.toString());
  expect(response.name).to.equal(document.name);
  expect(response.description).to.equal(document.description);
};

const validateProjectDeleted = (projectId: Project.IdType) => {
  cy.log('Get project document', projectId)
    .projectTask('getProjectById', [projectId])
    .should((document) => {
      expect(document).to.be.null;
    });
};

export const setProjectCommands = () => {
  Cypress.Commands.addAll<any, string>({
    prevSubject: true,
  }, {
    requestCreateProject,
    requestUpdateProject,
    requestDeleteProject,
    requestGetProject,
    requestGetProjectList,
  });

  Cypress.Commands.addAll({
    prevSubject: true,
  }, {
    validateProjectDocument,
    validateProjectResponse,
  });

  Cypress.Commands.addAll({
    projectTask,
    validateProjectDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProjectDeleted: CommandFunction<typeof validateProjectDeleted>;
      projectTask: CommandFunction<typeof projectTask>
    }

    interface ChainableRequest extends Chainable {
      requestCreateProject: CommandFunctionWithPreviousSubject<typeof requestCreateProject>;
      requestGetProject: CommandFunctionWithPreviousSubject<typeof requestGetProject>;
      requestUpdateProject: CommandFunctionWithPreviousSubject<typeof requestUpdateProject>;
      requestDeleteProject: CommandFunctionWithPreviousSubject<typeof requestDeleteProject>;
      requestGetProjectList: CommandFunctionWithPreviousSubject<typeof requestGetProjectList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProjectDocument: CommandFunctionWithPreviousSubject<typeof validateProjectDocument>;
      validateProjectResponse: CommandFunctionWithPreviousSubject<typeof validateProjectResponse>;
    }
  }
}
