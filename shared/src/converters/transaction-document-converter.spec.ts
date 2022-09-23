import { createAccountDocument, createAccountId, createAccountResponse, createCategoryDocument, createCategoryId, createCategoryResponse, createPaymentTransactionDocument, createPaymentTransactionRequest, createPaymentTransactionResponse, createProjectDocument, createProjectId, createProjectResponse, createRecipientDocument, createRecipientResponse, createTransactionId, createSplitTransactionDocument, createSplitTransactionRequest, createSplitTransactionResponse, createTransferTransactionDocument, createTransferTransactionRequest, createTransferTransactionResponse, createProductDocument } from '@household/shared/common/test-data-factory';
import { addSeconds } from '@household/shared/common/utils';
import { transactionDocumentConverterFactory, ITransactionDocumentConverter } from '@household/shared/converters/transaction-document-converter';
import { Types } from 'mongoose';
import { advanceTo, clear } from 'jest-date-mock';
import { IAccountDocumentConverter } from '@household/shared/converters/account-document-converter';
import { IProjectDocumentConverter } from '@household/shared/converters/project-document-converter';
import { createMockService, Mock, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { IRecipientDocumentConverter } from '@household/shared/converters/recipient-document-converter';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';

describe('Transaction document converter', () => {
  let converter: ITransactionDocumentConverter;
  let mockAccountDocumentConverter: Mock<IAccountDocumentConverter>;
  let mockProjectDocumentConverter: Mock<IProjectDocumentConverter>;
  let mockRecipientDocumentConverter: Mock<IRecipientDocumentConverter>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockAccountDocumentConverter = createMockService('toResponse');
    mockProjectDocumentConverter = createMockService('toResponse');
    mockRecipientDocumentConverter = createMockService('toResponse');
    mockCategoryDocumentConverter = createMockService('toResponse');
    mockProductDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = transactionDocumentConverterFactory(mockAccountDocumentConverter.service, mockProjectDocumentConverter.service, mockCategoryDocumentConverter.service, mockRecipientDocumentConverter.service, mockProductDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const accountId = new Types.ObjectId();
  const projectId = new Types.ObjectId();
  const categoryId = new Types.ObjectId();
  const productId = new Types.ObjectId();
  const amount = 12000;
  const description = 'bevásárlás';
  const expiresIn = 3600;
  const transactionId = new Types.ObjectId();

  const account = createAccountDocument();
  const project = createProjectDocument({
    _id: projectId,
  });
  const recipient = createRecipientDocument();
  const category = createCategoryDocument({
    _id: categoryId,
  });
  const product = createProductDocument({
    _id: productId,
  });

  const accountResponse = createAccountResponse();
  const categoryResponse = createCategoryResponse();
  const projectResponse = createProjectResponse();
  const recipientResponse = createRecipientResponse();

  describe('payment', () => {
    const body = createPaymentTransactionRequest({
      amount,
      description,
      issuedAt: now.toISOString(),
    });

    const queriedDocument = createPaymentTransactionDocument({
      _id: transactionId,
      account,
      project,
      category,
      recipient,
      amount,
      description,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    describe('createPaymentDocument', () => {
      it('should return document', () => {
        const result = converter.createPaymentDocument({
          body,
          account,
          category,
          project,
          recipient,
          product,
        }, undefined);
        expect(result).toEqual(createPaymentTransactionDocument({
          account,
          category,
          project,
          recipient,
          amount,
          description,
          issuedAt: now,
          expiresAt: undefined,
        }));
      });

      it('should return expiring document', () => {
        const result = converter.createPaymentDocument({
          body,
          account,
          category,
          project,
          recipient,
          product,
        }, expiresIn);
        expect(result).toEqual(createPaymentTransactionDocument({
          account,
          category,
          project,
          recipient,
          amount,
          description,
          issuedAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });

    });

    describe('updatePaymentDocument', () => {
      const { updatedAt, ...document } = queriedDocument;
      it('should update document', () => {
        const result = converter.updatePaymentDocument({
          body,
          document,
          account,
          category,
          project,
          recipient,
          product,
        }, expiresIn);
        expect(result).toEqual(createPaymentTransactionDocument({
          _id: transactionId,
          account,
          category,
          project,
          recipient,
          amount,
          description,
          issuedAt: now,
          createdAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);

        const result = converter.toResponse(queriedDocument);
        expect(result).toEqual(createPaymentTransactionResponse({
          transactionId: createTransactionId(transactionId.toString()),
          description,
          amount,
          issuedAt: now.toISOString(),
          account: accountResponse,
          project: projectResponse,
          recipient: recipientResponse,
          category: categoryResponse,
        }));
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, category);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);

        const result = converter.toResponseList([queriedDocument]);
        expect(result).toEqual([
          createPaymentTransactionResponse({
            transactionId: createTransactionId(transactionId.toString()),
            description,
            amount,
            issuedAt: now.toISOString(),
            account: accountResponse,
            project: projectResponse,
            recipient: recipientResponse,
            category: categoryResponse,
          }),
        ]);
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, category);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });
  });

  describe('split', () => {
    const body = createSplitTransactionRequest({
      description,
      issuedAt: now.toISOString(),
    }, {
      description,
      categoryId: createCategoryId(categoryId.toString()),
      projectId: createProjectId(projectId),
    });

    const queriedDocument = createSplitTransactionDocument({
      _id: transactionId,
      account,
      recipient,
      description,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    }, {
      category,
      description,
      project,
    });

    describe('createSplitDocument', () => {
      it('should return document', () => {
        const result = converter.createSplitDocument({
          body,
          account,
          categories: {},
          projects: {},
          products: {},
          recipient,
        }, undefined);
        expect(result).toEqual(createSplitTransactionDocument({
          account,
          recipient,
          description,
          issuedAt: now,
          expiresAt: undefined,
        }, {
          description,
          project,
          category,
        }));
      });

      it('should return expiring document', () => {
        const result = converter.createSplitDocument({
          body,
          account,
          categories: {},
          projects: {},
          products: {},
          recipient,
        }, expiresIn);
        expect(result).toEqual(createSplitTransactionDocument({
          account,
          recipient,
          description,
          issuedAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }, {
          description,
          project,
          category,
        }));
      });
    });

    describe('updateSplitDocument', () => {
      const { updatedAt, ...document } = queriedDocument;
      it('should update document', () => {
        const result = converter.updateSplitDocument({
          body,
          document,
          account,
          categories: {},
          projects: {},
          products: {},
          recipient,
        }, expiresIn);
        expect(result).toEqual(createSplitTransactionDocument({
          _id: transactionId,
          account,
          recipient,
          description,
          issuedAt: now,
          createdAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }, {
          description,
          project,
          category,
        }));
      });
    });

    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);

        const result = converter.toResponse(queriedDocument);
        expect(result).toEqual(createSplitTransactionResponse({
          transactionId: createTransactionId(transactionId.toString()),
          description,
          issuedAt: now.toISOString(),
          account: accountResponse,
          recipient: recipientResponse,
        }, {
          description,
          category: categoryResponse,
          project: projectResponse,
        }));
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, category);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValue(accountResponse);
        mockProjectDocumentConverter.functions.toResponse.mockReturnValue(projectResponse);
        mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);
        mockRecipientDocumentConverter.functions.toResponse.mockReturnValue(recipientResponse);

        const result = converter.toResponseList([queriedDocument]);
        expect(result).toEqual([
          createSplitTransactionResponse({
            transactionId: createTransactionId(transactionId.toString()),
            description,
            issuedAt: now.toISOString(),
            account: accountResponse,
            recipient: recipientResponse,
          }, {
            description,
            category: categoryResponse,
            project: projectResponse,
          }),
        ]);
        validateFunctionCall(mockAccountDocumentConverter.functions.toResponse, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse, project);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, category);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse, recipient);
        expect.assertions(5);
      });
    });
  });

  describe('transfer', () => {
    const transferAccountId = new Types.ObjectId();
    const transferAccountName = 'transfer account';
    const transferAccount = createAccountDocument({
      _id: transferAccountId,
      name: transferAccountName,
    });
    const transferAccountResponse = createAccountResponse({
      name: transferAccountName,
    });
    const body = createTransferTransactionRequest({
      amount,
      description,
      issuedAt: now.toISOString(),
    });

    const queriedDocument = createTransferTransactionDocument({
      _id: transactionId,
      account,
      transferAccount,
      amount,
      description,
      issuedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    describe('createTransferDocument', () => {
      it('should return document', () => {
        const result = converter.createTransferDocument({
          body,
          account,
          transferAccount,
        }, undefined);
        expect(result).toEqual(createTransferTransactionDocument({
          account,
          transferAccount,
          amount,
          description,
          issuedAt: now,
          expiresAt: undefined,
        }));
      });

      it('should return expiring document', () => {
        const result = converter.createTransferDocument({
          body,
          account,
          transferAccount,
        }, expiresIn);
        expect(result).toEqual(createTransferTransactionDocument({
          account,
          transferAccount,
          amount,
          description,
          issuedAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });

    });

    describe('updateTransferDocument', () => {
      const { updatedAt, ...document } = queriedDocument;
      it('should update document', () => {
        const result = converter.updateTransferDocument({
          body,
          document,
          account,
          transferAccount,
        }, expiresIn);
        expect(result).toEqual(createTransferTransactionDocument({
          _id: transactionId,
          account,
          transferAccount,
          amount,
          description,
          issuedAt: now,
          createdAt: now,
          expiresAt: addSeconds(expiresIn, now),
        }));
      });
    });

    describe('toResponse', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

        const result = converter.toResponse(queriedDocument, createAccountId(accountId.toString()));
        expect(result).toEqual(createTransferTransactionResponse({
          transactionId: createTransactionId(transactionId.toString()),
          description,
          amount: amount,
          issuedAt: now.toISOString(),
          account: accountResponse,
          transferAccount: transferAccountResponse,

        }));
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });

      it('should return response with inverted accounts', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);

        const result = converter.toResponse(queriedDocument, createAccountId(transferAccountId.toString()));
        expect(result).toEqual(createTransferTransactionResponse({
          transactionId: createTransactionId(transactionId.toString()),
          description,
          amount: -1 * amount,
          issuedAt: now.toISOString(),
          account: transferAccountResponse,
          transferAccount: accountResponse,

        }));
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, transferAccount);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, account);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });
    });

    describe('toResponseList', () => {
      it('should return response', () => {
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(accountResponse);
        mockAccountDocumentConverter.functions.toResponse.mockReturnValueOnce(transferAccountResponse);

        const result = converter.toResponseList([queriedDocument], createAccountId(accountId.toString()));
        expect(result).toEqual([
          createTransferTransactionResponse({
            transactionId: createTransactionId(transactionId.toString()),
            description,
            amount: amount,
            issuedAt: now.toISOString(),
            account: accountResponse,
            transferAccount: transferAccountResponse,
          }),
        ]);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 1, account);
        validateNthFunctionCall(mockAccountDocumentConverter.functions.toResponse, 2, transferAccount);
        validateFunctionCall(mockProjectDocumentConverter.functions.toResponse);
        validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
        validateFunctionCall(mockRecipientDocumentConverter.functions.toResponse);
        expect.assertions(6);
      });
    });
  });
});
