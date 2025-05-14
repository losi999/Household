import { File } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { default as schema } from '@household/test/api/schemas/file-url-response';
import { UserType } from '@household/shared/enums';

describe('POST /file/v1/files', () => {
  let request: File.Request;

  beforeEach(() => {
    request = fileDataFactory.request();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestCreateUploadUrl(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    describe('should upload file', () => {
      it('with complete body', () => {
        cy.authenticate(UserType.Editor)
          .requestCreateUploadUrl(request)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateFileDocument(request)
          .requestUploadFile()
          .validateFileInS3();
      });
    });

    describe('should return error', () => {
      describe('if fileType', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('fileType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('fileType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: 'not-enum' as any,
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('fileType', 'body');
        });
      });

      describe('if timezone', () => {
        it('is missing from body', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              timezone: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('timezone', 'body');
        });

        it('is not string', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              timezone: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('timezone', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(UserType.Editor)
            .requestCreateUploadUrl(fileDataFactory.request({
              timezone: '',
            }))
            .expectBadRequestResponse()
            .expectTooShortProperty('timezone', 1, 'body');
        });
      });
    });
  });
});
