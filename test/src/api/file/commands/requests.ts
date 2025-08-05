import { File } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateUploadUrl = (idToken: string, file: File.Request) => {
  return cy.request({
    body: file,
    method: 'POST',
    url: '/file/v1/files',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUploadFile = ({ url, fileId }: File.Url & File.FileId) => {
  return cy.request({
    method: 'PUT',
    url,
  })
    .wrap({
      fileId,
    }, {
      log: false,
    }) as Cypress.ChainableResponseBody;
};

const requestGetFileList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/file/v1/files',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteFile = (idToken: string, fileId: File.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/file/v1/files/${fileId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setFileRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateUploadUrl,
    requestGetFileList,
    requestUploadFile,
    requestDeleteFile,
  });

};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateUploadUrl: CommandFunctionWithPreviousSubject<typeof requestCreateUploadUrl>;
      requestGetFileList: CommandFunctionWithPreviousSubject<typeof requestGetFileList>;
      requestDeleteFile: CommandFunctionWithPreviousSubject<typeof requestDeleteFile>;
    }

    interface ChainableResponseBody extends Chainable {
      requestUploadFile: CommandFunctionWithPreviousSubject<typeof requestUploadFile>;
    }
  }
}
