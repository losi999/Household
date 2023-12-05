import { Project } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getProjectId } from '@household/shared/common/utils';

const validateProjectDocument = (response: Project.ProjectId, request: Project.Request) => {
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

const validateProjectDeleted = (projectId: Project.Id) => {
  cy.log('Get project document', projectId)
    .getProjectDocumentById(projectId)
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
    validateProjectListResponse,
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
      validateProjectListResponse: CommandFunctionWithPreviousSubject<typeof validateProjectListResponse>;
    }
  }
}
