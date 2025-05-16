import { default as schema } from '@household/test/api/schemas/project-response-list';
import { Project } from '@household/shared/types/types';
import { projectDataFactory } from './data-factory';
import { forbidUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = forbidUsers();

describe('GET /project/v1/projects', () => {
  let projectDocument1: Project.Document;
  let projectDocument2: Project.Document;

  beforeEach(() => {
    projectDocument1 = projectDataFactory.document();
    projectDocument2 = projectDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetProjectList()
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
            .requestGetProjectList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of projects', () => {
          cy.saveProjectDocument(projectDocument1)
            .saveProjectDocument(projectDocument2)
            .authenticate(userType)
            .requestGetProjectList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateProjectListResponse([
              projectDocument1,
              projectDocument2,
            ]);
        });
      }
    });
  });
});
