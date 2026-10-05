import { ICreateProductService, createProductServiceFactory } from '@household/api/functions/create-product/create-product.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';

describe('Create product service', () => {
  let service: ICreateProductService;
  let mockProductService: MockService<IProductService>;
  let mockProductDocumentConverter: MockService<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('saveProduct', 'findProductById');
    mockProductDocumentConverter = createMockService('create');

    service = createProductServiceFactory(mockProductService.service, mockProductDocumentConverter.service);
  });

  const queriedGenericProduct = testDataFactory.product.document.generic();
  const queriedSpecificProduct = testDataFactory.product.document.specific();
  const convertedProductDocument = testDataFactory.product.document.generic();
  const productId = getProductId(convertedProductDocument);

  describe('should return new', () => {
    it('generic product id', async () => {
      const body = testDataFactory.product.request.generic();
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);
    
      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(productId.toString());
      validateFunctionCall(mockProductService.functions.findProductById);
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        genericProduct: undefined,
        specificProduct: undefined,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(4);
    });
    
    it('specific product id', async () => {
      const body = testDataFactory.product.request.specific({
        parentProductId: getProductId(queriedGenericProduct),
      });
      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);
    
      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(productId.toString());
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedGenericProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        genericProduct: queriedGenericProduct,
        specificProduct: undefined,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(4);
    });
    
    it('variant product id', async () => {
      const body = testDataFactory.product.request.variant({
        parentProductId: getProductId(queriedSpecificProduct),
      });
      mockProductService.functions.findProductById.mockResolvedValue(queriedSpecificProduct);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);
    
      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(productId.toString());
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedSpecificProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        genericProduct: queriedSpecificProduct.genericProduct,
        specificProduct: queriedSpecificProduct,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(4);
    });

  });
  describe('should throw error', () => {
    it('if unable to query parent product', async () => {
      const body = testDataFactory.product.request.variant({
        parentProductId: getProductId(queriedSpecificProduct),
      });

      mockProductService.functions.findProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting product', 500));
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedSpecificProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if no parent product found', async () => {
      const body = testDataFactory.product.request.variant({
        parentProductId: getProductId(queriedSpecificProduct),
      });
      mockProductService.functions.findProductById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedSpecificProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if parent product is not "generic" type', async () => {
      const body = testDataFactory.product.request.specific({
        parentProductId: getProductId(queriedSpecificProduct),
      });

      mockProductService.functions.findProductById.mockResolvedValue(queriedSpecificProduct);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Product type of parent must be "generic" when creating "specific" product', 400));
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedSpecificProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if parent product is not "specific" type', async () => {
      const body = testDataFactory.product.request.variant({
        parentProductId: getProductId(queriedGenericProduct),
      });

      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Product type of parent must be "specific" when creating "variant" product', 400));
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedGenericProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if unable to save document', async () => {
      const body = testDataFactory.product.request.variant({
        parentProductId: getProductId(queriedSpecificProduct),
      });
      
      mockProductService.functions.findProductById.mockResolvedValue(queriedSpecificProduct);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving product', 500));
      validateFunctionCall(mockProductService.functions.findProductById, getProductId(queriedSpecificProduct));
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        genericProduct: queriedSpecificProduct.genericProduct,
        specificProduct: queriedSpecificProduct,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(5);
    });
  });
});
