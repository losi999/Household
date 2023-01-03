import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { Project } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST project/v1/projects', () => {
  let request: Project.Request;

  beforeEach(() => {
    request = {
      name: `name-${uuid()}`,
      description: 'description',
    };
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateProject(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should create project', () => {
      it('with complete body', () => {
        cy.authenticate(1)
          .requestCreateProject(request)
          .expectCreatedResponse()
          .validateProjectDocument(request);
      });

      describe('without optional property in body', () => {
        it('description', () => {
          const modifiedRequest: Project.Request = {
            ...request,
            description: undefined,
          };
          cy.authenticate(1)
            .requestCreateProject(modifiedRequest)
            .expectCreatedResponse()
            .validateProjectDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProject({
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProject({
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProject({
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different project', () => {
          const projectDocument = projectDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

          cy.saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestCreateProject(request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate project name');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProject({
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProject({
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });
    });
  });
});
