import { default as schema } from '@household/test/api/schemas/project-response';
import { Project } from '@household/shared/types/types';
import { getProjectId } from '@household/shared/common/utils';
import { projectDataFactory } from './data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [
  UserType.Editor,
  UserType.Viewer,
];

describe('GET /project/v1/projects/{projectId}', () => {
  let projectDocument: Project.Document;

  beforeEach(() => {
    projectDocument = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetProject(projectDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetProject(projectDataFactory.id())
            .expectForbiddenResponse();
        });
      } else {
        it('should get project by id', () => {
          cy.saveProjectDocument(projectDocument)
            .authenticate(userType)
            .requestGetProject(getProjectId(projectDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateProjectResponse(projectDocument);
        });

        describe('should return error if projectId', () => {
          it('is not mongo id', () => {
            cy.authenticate(userType)
              .requestGetProject(projectDataFactory.id('not-valid'))
              .expectBadRequestResponse()
              .expectWrongPropertyPattern('projectId', 'pathParameters');
          });

          it('does not belong to any project', () => {
            cy.authenticate(userType)
              .requestGetProject(projectDataFactory.id())
              .expectNotFoundResponse();
          });
        });
      }
    });
  });
});
