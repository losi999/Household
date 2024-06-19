import { Project } from '@household/shared/types/types';
import { projectDataFactory } from './data-factory';

describe('POST project/v1/projects', () => {
  let request: Project.Request;

  beforeEach(() => {
    request = projectDataFactory.request();
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
          request = projectDataFactory.request({
            description: undefined,
          });

          cy.authenticate(1)
            .requestCreateProject(request)
            .expectCreatedResponse()
            .validateProjectDocument(request);
        });
      });
    });

    describe('should return error', () => {
      describe('if name', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateProject(projectDataFactory.request({
              name: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('name', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateProject(projectDataFactory.request({
              name: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('name', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProject(projectDataFactory.request({
              name: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('name', 1, 'body');
        });

        it('is already in used by a different project', () => {
          const projectDocument = projectDataFactory.document(request);

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
            .requestCreateProject(projectDataFactory.request({
              description: 1,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('description', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
            .requestCreateProject(projectDataFactory.request({
              description: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('description', 1, 'body');
        });
      });
    });
  });
});
