import { testDataFactory } from '@household/shared/common/test-data-factory';
import { selectCustomerById, selectCustomerJobByIdAndName, selectCustomerList, selectCustomerWorks, selectFilteredCustomers } from '@household/web/app/hairdressing/customer/state/customer.selector';

describe('Customer selector', () => {
  it('Select customer list should return customer list', () => {
    const customerResponse = testDataFactory.customer.response();

    const result = selectCustomerList(false).projector({
      customerList: [customerResponse],
    });

    expect(result).toEqual([customerResponse]);      
  });

  it('Select filtered list should return customer list without excluded customers', () => {
    const excludedCustomer = testDataFactory.customer.response();
    const customerResponse = testDataFactory.customer.response();

    const result = selectFilteredCustomers(excludedCustomer.customerId).projector({
      customerList: [
        customerResponse,
        excludedCustomer,
      ],
    });

    expect(result).toEqual([customerResponse]);      
  });

  it('Select customer by id should return customer', () => {
    const customerResponse = testDataFactory.customer.response();

    const result = selectCustomerById(customerResponse.customerId).projector({
      customerList: [customerResponse],
    });

    expect(result).toEqual(customerResponse);      
  });

  it('Select customer works should return works of a customer', () => {
    const work = testDataFactory.calendar.entry.response.workBase();
    const customerId = testDataFactory.customer.id();

    const result = selectCustomerWorks(customerId).projector({
      customerWorks: {
        [customerId]: [work],
      },
    });
    expect(result).toEqual([work]);
  });

  it('Select customer job by id and name should return customer and its job', () => {
    const customerResponse = testDataFactory.customer.response();
    const job = customerResponse.jobs[0];

    const result = selectCustomerJobByIdAndName(customerResponse.customerId, job.name).projector({
      customerList: [customerResponse],
    });

    expect(result).toEqual({
      ...job,
      customer: customerResponse,
    });      
  });
});
