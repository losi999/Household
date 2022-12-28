import { Project } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IProjectService } from '@household/shared/services/project-service';
import { getProjectId } from '@household/shared/common/utils';

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

const requestMergeProjects = (idToken: string, projectId: Project.IdType, sourceProjectIds: Project.IdType[]) => {
  return cy.request({
    body: sourceProjectIds,
    method: 'POST',
    url: `/project/v1/projects/${projectId}/merge`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const validateProjectDocument = (response: Project.Id, request: Project.Request) => {
  const id = response?.projectId;

  cy.log('Get project document', id)
    .getProjectDocumentById(id)
    .should((document) => {
      expect(getProjectId(document), 'id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.description, 'description').to.equal(request.description);
    });
};

const validateProjectResponse = (response: Project.Response, document: Project.Document) => {
  expect(response.projectId, 'projectId').to.equal(getProjectId(document));
  expect(response.name, 'name').to.equal(document.name);
  expect(response.description, 'description').to.equal(document.description);
};

const validateProjectListResponse = (responses: Project.Response[], documents: Project.Document[]) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.projectId === getProjectId(document));
    validateProjectResponse(response, document);
  });
};

const validateProjectDeleted = (projectId: Project.IdType) => {
  cy.log('Get project document', projectId)
    .getProjectDocumentById(projectId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const saveProjectDocument = (...params: Parameters<IProjectService['saveProject']>) => {
  return cy.task<Project.Document>('saveProject', ...params);
};

const getProjectDocumentById = (...params: Parameters<IProjectService['getProjectById']>) => {
  return cy.task<Project.Document>('getProjectById', ...params);
};

export const setProjectCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateProject,
    requestUpdateProject,
    requestDeleteProject,
    requestGetProject,
    requestGetProjectList,
    requestMergeProjects,
    validateProjectDocument,
    validateProjectResponse,
    validateProjectListResponse,
  });

  Cypress.Commands.addAll({
    validateProjectDeleted,
    saveProjectDocument,
    getProjectDocumentById,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProjectDeleted: CommandFunction<typeof validateProjectDeleted>;
      saveProjectDocument: CommandFunction<typeof saveProjectDocument>;
      getProjectDocumentById: CommandFunction<typeof getProjectDocumentById>
    }

    interface ChainableRequest extends Chainable {
      requestCreateProject: CommandFunctionWithPreviousSubject<typeof requestCreateProject>;
      requestGetProject: CommandFunctionWithPreviousSubject<typeof requestGetProject>;
      requestUpdateProject: CommandFunctionWithPreviousSubject<typeof requestUpdateProject>;
      requestDeleteProject: CommandFunctionWithPreviousSubject<typeof requestDeleteProject>;
      requestGetProjectList: CommandFunctionWithPreviousSubject<typeof requestGetProjectList>;
      requestMergeProjects: CommandFunctionWithPreviousSubject<typeof requestMergeProjects>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProjectDocument: CommandFunctionWithPreviousSubject<typeof validateProjectDocument>;
      validateProjectResponse: CommandFunctionWithPreviousSubject<typeof validateProjectResponse>;
      validateProjectListResponse: CommandFunctionWithPreviousSubject<typeof validateProjectListResponse>;
    }
  }
}
