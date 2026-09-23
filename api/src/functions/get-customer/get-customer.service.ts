import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IGetCustomerService {
  (ctx: Api.Customer.CustomerId): Promise<Responses.Customer>;
}

export const getCustomerServiceFactory = (
  customerService: ICustomerService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IGetCustomerService => {
  return async ({ customerId }) => {
    const customer = await customerService.getCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    return customerDocumentConverter.toResponse(customer);
  };
};
