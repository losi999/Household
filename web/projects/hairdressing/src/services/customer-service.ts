import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_URL } from '@household/shared-ui';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private httpClient = inject(HttpClient);
  private apiUrl = inject(API_URL);
  
  listCustomers() {
    return this.httpClient.get<Responses.Customer[]>(`${this.apiUrl}/customer/v1/customers`);
  }

  createCustomer(body: Requests.Customer) {
    return this.httpClient.post<Api.Customer.CustomerId>(`${this.apiUrl}/customer/v1/customers`, body);
  }

  getCustomerById(customerId: Api.Customer.Id) {
    return this.httpClient.get<Responses.Customer>(`${this.apiUrl}/customer/v1/customers/${customerId}`);
  }

  updateCustomer(customerId: Api.Customer.Id, body: Requests.Customer) {
    return this.httpClient.put(`${this.apiUrl}/customer/v1/customers/${customerId}`, body);
  }

  deleteCustomer(customerId: Api.Customer.Id) {
    return this.httpClient.delete(`${this.apiUrl}/customer/v1/customers/${customerId}`);
  }

  createCustomerJob(customerId: Api.Customer.Id, body: Requests.CustomerJob) {
    return this.httpClient.post(`${this.apiUrl}/customer/v1/customers/${customerId}/jobs`, body);
  }

  updateCustomerJob(customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name'], body: Requests.CustomerJob) {
    return this.httpClient.put(`${this.apiUrl}/customer/v1/customers/${customerId}/jobs/${jobName}`, body);
  }

  deleteCustomerJob(customerId: Api.Customer.Id, jobName: Api.Customer.Job.Name['name']) {
    return this.httpClient.delete(`${this.apiUrl}/customer/v1/customers/${customerId}/jobs/${jobName}`);
  }

  listCustomerWorks(customerId: Api.Customer.Id) {
    return this.httpClient.get<Responses.CalendarEntryWorkLean[]>(`${this.apiUrl}/customer/v1/customers/${customerId}/works`);
  }

  updateCustomerBlacklist(body: Api.Customer.Id[]) {
    return this.httpClient.put(`${this.apiUrl}/customer/v1/customers/blacklist`, body);
  }

  deleteCustomerBlacklist(body: Api.Customer.Id[]) {
    return this.httpClient.delete(`${this.apiUrl}/customer/v1/customers/blacklist`, {
      body,
    });
  }
}
