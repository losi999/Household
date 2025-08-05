import { entries, getProjectId } from '@household/shared/common/utils';
import { Project } from '@household/shared/types/types';
import { projectDataFactory } from './data-factory';
import { allowUsers } from '@household/test/api/utils';

const permissionMap = allowUsers('editor') ;

describe('PUT /project/v1/projects/{projectId}', () => {
  let request: Project.Request;
  let projectDocument: Project.Document;

  beforeEach(() => {
    request = projectDataFactory.request();

    projectDocument = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestUpdateProject(projectDataFactory.id(), request)
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestUpdateProject(projectDataFactory.id(), request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should update project', () => {
          it('with complete body', () => {
            cy
              .saveProjectDocument(projectDocument)
              .authenticate(userType)
              .requestUpdateProject(getProjectId(projectDocument), request)
              .expectCreatedResponse()
              .validateProjectDocument(request);
          });

          describe('without optional property in body', () => {
            it('description', () => {
              request = projectDataFactory.request({
                description: undefined,
              });

              cy.saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestUpdateProject(getProjectId(projectDocument), request)
                .expectCreatedResponse()
                .validateProjectDocument(request);
            });
          });
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in used by a different project', () => {
              const duplicateProjectDocument = projectDataFactory.document(request);

              cy.saveProjectDocument(projectDocument)
                .saveProjectDocument(duplicateProjectDocument)
                .authenticate(userType)
                .requestUpdateProject(getProjectId(projectDocument), request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate project name');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), projectDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });

          describe('if projectId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id('not-valid'), request)
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('projectId', 'pathParameters');
            });

            it('does not belong to any project', () => {
              cy.authenticate(userType)
                .requestUpdateProject(projectDataFactory.id(), request)
                .expectNotFoundResponse();
            });
          });
        });
      }
    });
  });
});
