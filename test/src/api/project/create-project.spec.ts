import { Project } from '@household/shared/types/types';
import { projectDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

describe('POST project/v1/projects', () => {
  let request: Project.Request;

  beforeEach(() => {
    request = projectDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateProject(request)
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestCreateProject(request)
            .expectForbiddenResponse();
        });
      } else {
        describe('should create project', () => {
          it('with complete body', () => {
            cy.authenticate(userType)
              .requestCreateProject(request)
              .expectCreatedResponse()
              .validateProjectDocument(request);
          });

          describe('without optional property in body', () => {
            it('description', () => {
              request = projectDataFactory.request({
                description: undefined,
              });

              cy.authenticate(userType)
                .requestCreateProject(request)
                .expectCreatedResponse()
                .validateProjectDocument(request);
            });
          });
        });

        describe('should return error', () => {
          describe('if name', () => {
            it('is missing from body', () => {
              cy.authenticate(userType)
                .requestCreateProject(projectDataFactory.request({
                  name: undefined,
                }))
                .expectBadRequestResponse()
                .expectRequiredProperty('name', 'body');
            });

            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateProject(projectDataFactory.request({
                  name: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('name', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateProject(projectDataFactory.request({
                  name: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('name', 1, 'body');
            });

            it('is already in used by a different project', () => {
              const projectDocument = projectDataFactory.document(request);

              cy.saveProjectDocument(projectDocument)
                .authenticate(userType)
                .requestCreateProject(request)
                .expectBadRequestResponse()
                .expectMessage('Duplicate project name');
            });
          });

          describe('if description', () => {
            it('is not string', () => {
              cy.authenticate(userType)
                .requestCreateProject(projectDataFactory.request({
                  description: <any>1,
                }))
                .expectBadRequestResponse()
                .expectWrongPropertyType('description', 'string', 'body');
            });

            it('is too short', () => {
              cy.authenticate(userType)
                .requestCreateProject(projectDataFactory.request({
                  description: '',
                }))
                .expectBadRequestResponse()
                .expectTooShortProperty('description', 1, 'body');
            });
          });
        });
      }
    });
  });
});
