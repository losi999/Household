import { getFileId } from '@household/shared/common/utils';
import { FileProcessingStatus } from '@household/shared/enums';
import { File, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

const validateFileDocument = (body: File.FileId, request: File.Request) => {
  return cy.log('Get file document', body.fileId)
    .getFileDocumentById(body.fileId)
    .should((document) => {
      const { fileType, timezone, draftCount, processingStatus, ...internal } = document;

      expect(fileType, 'fileType').to.equal(request.fileType);
      expect(timezone, 'timezone').to.equal(request.timezone);
      expect(draftCount, 'draftCount').to.be.undefined;
      expect(processingStatus, 'processingStatus').to.equal(FileProcessingStatus.Pending);
      expectRemainingProperties(internal);

    })
    .wrap(body, {
      log: false,
    }) as Cypress.ChainableResponseBody;
};

const validateFileDocumentProcessed = (originalDocument: File.Document) => {
  const fileId = getFileId(originalDocument);

  cy.log('Get file document', fileId)
    .getFileDocumentById(fileId)
    .should((document) => {
      const { fileType, timezone, draftCount, processingStatus, ...internal } = document;

      expect(fileType, 'fileType').to.equal(originalDocument.fileType);
      expect(timezone, 'timezone').to.equal(originalDocument.timezone);
      expect(draftCount, 'draftCount').to.be.undefined;
      expect(processingStatus, 'processingStatus').to.equal(FileProcessingStatus.Completed);
      expectRemainingProperties(internal);
    });
};

const validateFileInS3 = ({ fileId }: File.FileId) => {
  return cy.log('Reading file from S3', fileId)
    .chechFileInS3(fileId)
    .should((file) => {
      expect(file).to.be.not.undefined;
    })
    .wrap({
      fileId,
    }, {
      log: false,
    });
};

const validateFileDeletedFromS3 = (fileId: File.Id) => {
  cy.log('Reading file from S3', fileId)
    .chechFileInS3(fileId)
    .should((file) => {
      expect(file).to.be.null;
    });
};

const validateFileResponse = (nestedPath: string = '') => (response: File.Response, document: File.Document, count: number) => {
  const { draftCount, fileId, fileType, uploadedAt, ...internal } = response;

  expect(fileId, `${nestedPath}fileId`).to.equal(getFileId(document));
  expect(draftCount, `${nestedPath}draftCount`).to.equal(count);
  expect(fileType, `${nestedPath}fileType`).to.equal(document.fileType);
  expectEmptyObject(internal, nestedPath);
};

const validateNestedFileResponse = (nestedPath: string, ...rest: Parameters<ReturnType<typeof validateFileResponse>>) => validateFileResponse(nestedPath)(...rest);

const validateFileListResponse = (responses: File.Response[], drafts: Transaction.DraftDocument[]) => {
  const map = drafts.reduce<{[fileId: File.Id]: {
    file: File.Document;
    count: number
  }}>((accumulator, currentvalue) => {
    const fileId = getFileId(currentvalue.file);
    return {
      ...accumulator,
      [fileId]: {
        file: currentvalue.file,
        count: (accumulator[fileId]?.count ?? 0) + 1,
      },
    };
  }, {});

  Object.values(map).forEach(({ count, file }, index) => {
    const response = responses.find(r => r.fileId === getFileId(file));
    cy.validateNestedFileResponse(`[${index}].`, response, file, count);
  });
};

const validateFileDeleted = (fileId: File.Id) => {
  cy.log('Get file document', fileId)
    .getFileDocumentById(fileId)
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

export const setFileValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateFileDocument,
    validateFileInS3,
    validateFileResponse: validateFileResponse(),
    validateFileListResponse,
  });

  Cypress.Commands.addAll({
    validateFileDeleted,
    validateNestedFileResponse,
    validateFileDeletedFromS3,
    validateFileDocumentProcessed,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateFileDeleted: CommandFunction<typeof validateFileDeleted>;
      validateNestedFileResponse: CommandFunction<typeof validateNestedFileResponse>;
      validateFileDeletedFromS3: CommandFunction<typeof validateFileDeletedFromS3>;
      validateFileDocumentProcessed: CommandFunction<typeof validateFileDocumentProcessed>;
    }

    interface ChainableResponseBody extends Chainable {
      validateFileDocument: CommandFunctionWithPreviousSubject<typeof validateFileDocument>;
      validateFileInS3: CommandFunctionWithPreviousSubject<typeof validateFileInS3>;
      validateFileResponse: CommandFunctionWithPreviousSubject<ReturnType<typeof validateFileResponse>>;
      validateFileListResponse: CommandFunctionWithPreviousSubject<typeof validateFileListResponse>;
    }
  }
}
