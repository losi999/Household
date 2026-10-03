import { IUpdateProductService, updateProductServiceFactory } from '@household/api/functions/update-product/update-product.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';

describe('Update product service', () => {
  let service: IUpdateProductService;
  let mockProductService: MockService<IProductService>;
  let mockProductDocumentConverter: MockService<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('findProductById', 'listProductsByParentId', 'updateProduct');
    mockProductDocumentConverter = createMockService('update');

    service = updateProductServiceFactory(mockProductService.service, mockProductDocumentConverter.service);
  });

  const queriedGenericProduct = testDataFactory.product.document.generic();
  const queriedSpecificProduct = testDataFactory.product.document.specific();
  const queriedVariantProduct = testDataFactory.product.document.variant();
  const parentGenericProduct = testDataFactory.product.document.generic();
  const parentSpecificProduct = testDataFactory.product.document.specific();
  const updateQuery = testDataFactory.documentUpdate();

  describe('should return if', () => {
    it('generic product is updated', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.generic();

      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
      mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProductService.functions.updateProduct.mockResolvedValue(undefined);

      await service({
        body,
        productId,
        expiresIn: undefined,
      });
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update, {
        body,
        genericProduct: undefined,
        specificProduct: undefined,
      }, undefined);
      validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
      expect.assertions(4);
    });

    it('specific product is updated', async () => {
      const productId = getProductId(queriedSpecificProduct);
      const parentProductId = getProductId(parentGenericProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedSpecificProduct)
        .mockResolvedValueOnce(parentGenericProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
      mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProductService.functions.updateProduct.mockResolvedValue(undefined);

      await service({
        body,
        productId,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update, {
        body,
        genericProduct: parentGenericProduct,
        specificProduct: undefined,
      }, undefined);
      validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
      expect.assertions(5);
    });

    it('variant product is updated', async () => {
      const productId = getProductId(queriedVariantProduct);
      const parentProductId = getProductId(parentSpecificProduct);
      const body = testDataFactory.product.request.variant({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedVariantProduct)
        .mockResolvedValueOnce(parentSpecificProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
      mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProductService.functions.updateProduct.mockResolvedValue(undefined);

      await service({
        body,
        productId,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update, {
        body,
        genericProduct: parentSpecificProduct.genericProduct,
        specificProduct: parentSpecificProduct,
      }, undefined);
      validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
      expect.assertions(5);
    });
  });

  describe('should throw error', () => {
    it('if unable to query product', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.generic();

      mockProductService.functions.findProductById.mockRejectedValue('this is a mongo error');
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting product', 500));
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(6);
    });

    it('if product not found', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.generic();

      mockProductService.functions.findProductById.mockResolvedValue(undefined);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 404));
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(6);
    });

    it('if unable to list child products', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId: getProductId(parentGenericProduct),
      });

      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductService.functions.listProductsByParentId.mockRejectedValue('this is a mongo error');

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while listing products by parent Id', 500));
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(6);
    });

    it('if product type is changed while the product has children', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId: getProductId(parentGenericProduct),
      });

      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([queriedSpecificProduct]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Product type cannot be updated if there are child products', 400));
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(6);
    });

    it('if unable to query parent product', async () => {
      const productId = getProductId(queriedSpecificProduct);
      const parentProductId = getProductId(parentGenericProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedSpecificProduct)
        .mockRejectedValueOnce('this is a mongo error');
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting product', 500));
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(7);
    });

    it('if parent product not found', async () => {
      const productId = getProductId(queriedSpecificProduct);
      const parentProductId = getProductId(parentGenericProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedSpecificProduct)
        .mockResolvedValueOnce(undefined);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 400));
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(7);
    });

    it('if parent product is not "generic" type', async () => {
      const productId = getProductId(queriedSpecificProduct);
      const parentProductId = getProductId(parentSpecificProduct);
      const body = testDataFactory.product.request.specific({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedSpecificProduct)
        .mockResolvedValueOnce(parentSpecificProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Product type of parent must be "generic" when creating "specific" product', 400));
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(7);
    });

    it('if parent product is not "specific" type', async () => {
      const productId = getProductId(queriedVariantProduct);
      const parentProductId = getProductId(parentGenericProduct);
      const body = testDataFactory.product.request.variant({
        parentProductId,
      });

      mockProductService.functions.findProductById.mockResolvedValueOnce(queriedVariantProduct)
        .mockResolvedValueOnce(parentGenericProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Product type of parent must be "specific" when creating "variant" product', 400));
      validateNthFunctionCall(mockProductService.functions.findProductById, 1, productId);
      validateNthFunctionCall(mockProductService.functions.findProductById, 2, parentProductId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(7);
    });

    it('if unable to update product', async () => {
      const productId = getProductId(queriedGenericProduct);
      const body = testDataFactory.product.request.generic();

      mockProductService.functions.findProductById.mockResolvedValue(queriedGenericProduct);
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
      mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProductService.functions.updateProduct.mockRejectedValue('this is a mongo error');

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating product', 500));
      validateFunctionCall(mockProductService.functions.findProductById, productId);
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update, {
        body,
        genericProduct: undefined,
        specificProduct: undefined,
      }, undefined);
      validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
      expect.assertions(6);
    });
  });
});
