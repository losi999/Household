import { Project } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getProjectId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateProjectDocument = (response: Project.ProjectId, request: Project.Request) => {
  const id = response?.projectId;

  cy.log('Get project document', id)
    .findProjectDocumentById(id)
    .should((document) => {
      const { name, description, ...internal } = document;

      expect(getProjectId(document), 'id').to.equal(id);
      expect(name, 'name').to.equal(request.name);
      expect(description, 'description').to.equal(request.description);
      expectRemainingProperties(internal);
    });
};

const validateProjectResponse = (response: Project.Response, document: Project.Document) => {
  const { projectId, name, description, ...internal } = response;

  expect(projectId, 'projectId').to.equal(getProjectId(document));
  expect(name, 'name').to.equal(document.name);
  expect(description, 'description').to.equal(document.description);
  expectEmptyObject(internal);
};

const validateInProjectListResponse = (responses: Project.Response[], document: Project.Document) => {
  const response = responses.find(r => r.projectId === getProjectId(document));
  validateProjectResponse(response, document);

  return cy.wrap(responses, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

const validateProjectDeleted = (projectId: Project.Id) => {
  cy.log('Get project document', projectId)
    .findProjectDocumentById(projectId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setProjectValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateProjectDocument,
    validateProjectResponse,
    validateInProjectListResponse,
  });

  Cypress.Commands.addAll({
    validateProjectDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProjectDeleted: CommandFunction<typeof validateProjectDeleted>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProjectDocument: CommandFunctionWithPreviousSubject<typeof validateProjectDocument>;
      validateProjectResponse: CommandFunctionWithPreviousSubject<typeof validateProjectResponse>;
      validateInProjectListResponse: CommandFunctionWithPreviousSubject<typeof validateInProjectListResponse>;
    }
  }
}
