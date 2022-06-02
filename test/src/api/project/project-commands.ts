import { Project } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateProject = (idToken: string, project: Project.Request) => {
  return cy.request({
    body: project,
    method: 'POST',
    url: 'project/v1/projects',
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

const saveProjectDocument = (document: Project.Document) => {
  return cy.log('Save project document', document).task('saveProject', document, {
    log: false,
  });
};

const validateProjectDocument = (response: Project.Response, request: Project.Request, projectId?: string) => {
  const id = response?.projectId ?? projectId as Project.IdType;

  cy.log('Get project document', id)
    .task('getProjectById', id)
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
    .task('getProjectById', projectId)
    .should((document) => {
      expect(document).to.be.null;
    });
};

export const setProjectCommands = () => {
  Cypress.Commands.add<any>('requestCreateProject', {
    prevSubject: true,
  }, requestCreateProject);
  Cypress.Commands.add<any>('requestUpdateProject', {
    prevSubject: true,
  }, requestUpdateProject);
  Cypress.Commands.add<any>('requestDeleteProject', {
    prevSubject: true,
  }, requestDeleteProject);
  Cypress.Commands.add<any>('requestGetProject', {
    prevSubject: true,
  }, requestGetProject);
  Cypress.Commands.add<any>('requestGetProjectList', {
    prevSubject: true,
  }, requestGetProjectList);

  Cypress.Commands.add<any>('saveProjectDocument', saveProjectDocument);

  Cypress.Commands.add<any>('validateProjectDocument', {
    prevSubject: true,
  }, validateProjectDocument);
  Cypress.Commands.add<any>('validateProjectResponse', {
    prevSubject: true,
  }, validateProjectResponse);
  Cypress.Commands.add<any>('validateProjectDeleted', validateProjectDeleted);
};

declare global {
  namespace Cypress {
    interface Chainable {
      saveProjectDocument: CommandFunction<typeof saveProjectDocument>;
      validateProjectDeleted: CommandFunction<typeof validateProjectDeleted>;
    }

    interface ChainableRequest extends Chainable {
      requestGetProject: CommandFunctionWithPreviousSubject<typeof requestGetProject>;
      requestCreateProject: CommandFunctionWithPreviousSubject<typeof requestCreateProject>;
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
