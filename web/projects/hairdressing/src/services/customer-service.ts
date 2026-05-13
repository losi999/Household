import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Calendar, Customer } from '@household/shared/types/types';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private httpClient = inject(HttpClient);
  
  listCustomers() {
    return this.httpClient.get<Customer.Response[]>('https://local-householdapi.losi999.hu/customer/v1/customers');
  }

  createCustomer(body: Customer.Request) {
    return this.httpClient.post<Customer.CustomerId>('https://local-householdapi.losi999.hu/customer/v1/customers', body);
  }

  getCustomerById(customerId: Customer.Id) {
    return this.httpClient.get<Customer.Response>(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}`);
  }

  updateCustomer(customerId: Customer.Id, body: Customer.Request) {
    return this.httpClient.put<Customer.CustomerId>(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}`, body);
  }

  deleteCustomer(customerId: Customer.Id) {
    return this.httpClient.delete(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}`);
  }

  createCustomerJob(customerId: Customer.Id, body: Customer.Job.Request) {
    return this.httpClient.post(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}/jobs`, body);
  }

  updateCustomerJob(customerId: Customer.Id, jobName: Customer.Job.Name['name'], body: Customer.Job.Request) {
    return this.httpClient.put(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}/jobs/${jobName}`, body);
  }

  deleteCustomerJob(customerId: Customer.Id, jobName: Customer.Job.Name['name']) {
    return this.httpClient.delete(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}/jobs/${jobName}`);
  }

  listCustomerWorks(customerId: Customer.Id) {
    return this.httpClient.get<Calendar.Entry.ResponseBase[]>(`https://local-householdapi.losi999.hu/customer/v1/customers/${customerId}/works`);
  }

  updateCustomerBlacklist(body: Customer.Id[]) {
    return this.httpClient.put('https://local-householdapi.losi999.hu/customer/v1/customers/blacklist', body);
  }

  deleteCustomerBlacklist(body: Customer.Id[]) {
    return this.httpClient.delete('https://local-householdapi.losi999.hu/customer/v1/customers/blacklist', {
      body,
    });
  }
}
