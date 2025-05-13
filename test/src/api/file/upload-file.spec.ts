import { File } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { default as schema } from '@household/test/api/schemas/file-url-response';

describe('POST /file/v1/files', () => {
  let request: File.Request;
  let fileId: File.Id;

  beforeEach(() => {
    fileId = undefined;
    request = fileDataFactory.request();
  });

  afterEach(() => {
    if (fileId) {
      cy.wait(3000).deleteFileFromS3(fileId);
    }
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestCreateUploadUrl(request)
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should upload file', () => {
      it('with complete body', () => {
        cy.authenticate(1)
          .requestCreateUploadUrl(request)
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateFileDocument(request)
          .requestUploadFile()
          .validateFileInS3()
          .then((body) => {
            fileId = body.fileId;
          });
      });
    });

    describe('should return error', () => {
      describe('if fileType', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('fileType', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('fileType', 'string', 'body');
        });

        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestCreateUploadUrl(fileDataFactory.request({
              fileType: 'not-enum' as any,
            }))
            .expectBadRequestResponse()
            .expectWrongEnumValue('fileType', 'body');
        });
      });

      describe('if timezone', () => {
        it('is missing from body', () => {
          cy.authenticate(1)
            .requestCreateUploadUrl(fileDataFactory.request({
              timezone: undefined,
            }))
            .expectBadRequestResponse()
            .expectRequiredProperty('timezone', 'body');
        });

        it('is not string', () => {
          cy.authenticate(1)
            .requestCreateUploadUrl(fileDataFactory.request({
              timezone: 1 as any,
            }))
            .expectBadRequestResponse()
            .expectWrongPropertyType('timezone', 'string', 'body');
        });

        it('is too short', () => {
          cy.authenticate(1)
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
