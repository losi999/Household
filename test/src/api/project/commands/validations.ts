import { Project } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getProjectId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateProjectDocument = (response: Project.ProjectId, request: Project.Request) => {
  const id = response?.projectId;

  cy.log('Get project document', id)
    .getProjectDocumentById(id)
    .should((document) => {
      const { name, description, ...internal } = document;

      expect(getProjectId(document), 'id').to.equal(id);
      expect(name, 'name').to.equal(request.name);
      expect(description, 'description').to.equal(request.description);
      expectRemainingProperties(internal);
    });
};

const validateProjectResponse = (nestedPath: string = '') => (response: Project.Response, document: Project.Document) => {
  const { projectId, name, description, ...internal } = response;

  expect(projectId, `${nestedPath}projectId`).to.equal(getProjectId(document));
  expect(name, `${nestedPath}name`).to.equal(document.name);
  expect(description, `${nestedPath}description`).to.equal(document.description);
  expectEmptyObject(internal, nestedPath);
};

const validateNestedProjectResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateProjectResponse>>) => validateProjectResponse(nestedPath)(...rest);

const validateProjectListResponse = (responses: Project.Response[], documents: Project.Document[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.projectId === getProjectId(document));
    cy.validateNestedProjectResponse(`[${index}].`, response, document);
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
    validateProjectResponse: validateProjectResponse(),
    validateProjectListResponse,
  });

  Cypress.Commands.addAll({
    validateProjectDeleted,
    validateNestedProjectResponse,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateProjectDeleted: CommandFunction<typeof validateProjectDeleted>;
      validateNestedProjectResponse: CommandFunction<typeof validateNestedProjectResponse>;
    }

    interface ChainableResponseBody extends Chainable {
      validateProjectDocument: CommandFunctionWithPreviousSubject<typeof validateProjectDocument>;
      validateProjectResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateProjectResponse>>;
      validateProjectListResponse: CommandFunctionWithPreviousSubject<typeof validateProjectListResponse>;
    }
  }
}
