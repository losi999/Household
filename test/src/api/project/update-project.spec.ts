import { createProjectId } from '@household/shared/common/test-data-factory';
import { getProjectId } from '@household/shared/common/utils';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { Project } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('PUT /project/v1/projects/{projectId}', () => {
  let request: Project.Request;
  let projectDocument: Project.Document;

  beforeEach(() => {
    request = {
      name: `new name-${uuid()}`,
      description: 'new desc',
    };

    projectDocument = projectDocumentConverter.create({
      name: `old name-${uuid()}`,
      description: 'old desc',
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestUpdateProject(createProjectId(), request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should update project', () => {
      it('with complete body', () => {
        cy
          .saveProjectDocument(projectDocument)
          .authenticate(1)
          .requestUpdateProject(getProjectId(projectDocument), request)
          .expectCreatedResponse()
          .validateProjectDocument(request);
      });

      describe('without optional property in body', () => {
        it('description', () => {
          const modifiedRequest: Project.Request = {
            ...request,
            description: undefined,
          };
          cy.saveProjectDocument(projectDocument)
            .authenticate(1)
            .requestUpdateProject(getProjectId(projectDocument), modifiedRequest)
            .expectCreatedResponse()
            .validateProjectDocument(modifiedRequest);
        });
      });
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), {
              ...request,
              name: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), {
              ...request,
              name: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), {
              ...request,
              name: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different project', () => {
          const duplicateProjectDocument = projectDocumentConverter.create(request, Cypress.env('EXPIRES_IN'), true);

          cy.saveProjectDocument(projectDocument)
            .saveProjectDocument(duplicateProjectDocument)
            .authenticate(1)
            .requestUpdateProject(getProjectId(projectDocument), request)
            .expectBadRequestResponse()
            .expectMessage('Duplicate project name');
        });
      });

      describe('if description', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), {
              ...request,
              description: 1 as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), {
              ...request,
              description: '',
            })
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });

      describe('if projectId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId('not-valid'), request)
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('projectId', 'pathParameters');
        });

        it('does not belong to any project', () => {
          cy.authenticate(1)
            .requestUpdateProject(createProjectId(), request)
            .expectNotFoundResponse();
        });
      });
    });
  });

});
