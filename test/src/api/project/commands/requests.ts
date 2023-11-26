import { Project } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

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

const requestUpdateProject = (idToken: string, projectId: Project.Id, project: Project.Request) => {
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

const requestDeleteProject = (idToken: string, projectId: Project.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/project/v1/projects/${projectId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetProject = (idToken: string, projectId: Project.Id) => {
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

const requestMergeProjects = (idToken: string, projectId: Project.Id, sourceProjectIds: Project.Id[]) => {
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

export const setProjectRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateProject,
    requestUpdateProject,
    requestDeleteProject,
    requestGetProject,
    requestGetProjectList,
    requestMergeProjects,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateProject: CommandFunctionWithPreviousSubject<typeof requestCreateProject>;
      requestGetProject: CommandFunctionWithPreviousSubject<typeof requestGetProject>;
      requestUpdateProject: CommandFunctionWithPreviousSubject<typeof requestUpdateProject>;
      requestDeleteProject: CommandFunctionWithPreviousSubject<typeof requestDeleteProject>;
      requestGetProjectList: CommandFunctionWithPreviousSubject<typeof requestGetProjectList>;
      requestMergeProjects: CommandFunctionWithPreviousSubject<typeof requestMergeProjects>;
    }
  }
}
