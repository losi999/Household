import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateCustomerJobService {
  (ctx: {
    body: Requests.CustomerJob
  } & Api.Customer.CustomerId & Api.Customer.Job.Name): Promise<unknown>;
}

export const updateCustomerJobServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
  priceService: IPriceService): IUpdateCustomerJobService => {
  return async ({ body, customerId, name }) => {
    const customer = await customerService.findCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    httpErrors.customer.jobNotFound({
      customer,
      jobName: name,
    });

    httpErrors.customer.duplicateJobName({
      job: body,
      customer,
      jobName: name,
    });

    const priceIds = body.prices?.map(p => p.priceId) ?? [];

    const priceDocuments = await priceService.findPricesByIds(priceIds).catch(httpErrors.price.listByIds(priceIds));

    httpErrors.price.multipleNotFound({
      priceIds,
      prices: priceDocuments,  
    });

    const update = customerDocumentConverter.updateJob(name, body, priceDocuments); 

    return customerService.updateCustomer(customerId, update).catch(httpErrors.customer.update({
      customerId,
      update,
    }));
  };
};
