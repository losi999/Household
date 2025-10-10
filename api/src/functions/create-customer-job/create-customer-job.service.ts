import { httpErrors } from '@household/api/common/error-handlers';
import { isPriceBase } from '@household/shared/common/type-guards';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';
import { Customer, Price } from '@household/shared/types/types';

export interface ICreateCustomerJobService {
  (ctx: {
    body: Customer.Job.Request; 
  } & Customer.CustomerId): Promise<void>;
}

export const createCustomerJobServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
  priceService: IPriceService): ICreateCustomerJobService => {
  return async ({ body, customerId }) => {
    const customer = await customerService.findCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    httpErrors.customer.duplicateJobName({
      job: body,
      customer,
    });

    const priceIds = body.prices.reduce<Price.Id[]>((accumulator, currentValue) => {
      if (!isPriceBase(currentValue)) {
        return [
          ...accumulator,
          currentValue.priceId,
        ];
      }

      return accumulator;
    }, []);

    const priceDocuments = await priceService.findPricesByIds(priceIds).catch(httpErrors.price.listByIds(priceIds));

    const update = customerDocumentConverter.addJob(body, priceDocuments); 

    await customerService.updateCustomer(customerId, update).catch(httpErrors.customer.update({
      customerId,
      update,
    }));
  };
};
