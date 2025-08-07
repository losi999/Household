import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '@household/shared/types/types';
import { environment } from '@household/web/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {

  constructor(private httpClient: HttpClient) { }

  listCustomers() {
    return this.httpClient.get<Customer.Response[]>(`${environment.apiUrl}/customer/v1/customers`);
  }

  createCustomer(body: Customer.Request) {
    return this.httpClient.post<Customer.CustomerId>(`${environment.apiUrl}/customer/v1/customers`, body);
  }

  getCustomerById(customerId: Customer.Id) {
    return this.httpClient.get<Customer.Response>(`${environment.apiUrl}/customer/v1/customers/${customerId}`);
  }

  updateCustomer(customerId: Customer.Id, body: Customer.Request) {
    return this.httpClient.put<Customer.CustomerId>(`${environment.apiUrl}/customer/v1/customers/${customerId}`, body);
  }

  createCustomerJob(customerId: Customer.Id, body: Customer.Job) {
    return this.httpClient.post(`${environment.apiUrl}/customer/v1/customers/${customerId}/jobs`, body);
  }

  updateCustomerJob(customerId: Customer.Id, jobName: Customer.JobName['name'], body: Customer.Job) {
    return this.httpClient.put(`${environment.apiUrl}/customer/v1/customers/${customerId}/jobs/${jobName}`, body);
  }

  deleteCustomerJob(customerId: Customer.Id, jobName: Customer.JobName['name']) {
    return this.httpClient.delete(`${environment.apiUrl}/customer/v1/customers/${customerId}/jobs/${jobName}`);
  }

  // deleteCustomer(recipientId: Customer.Id) {
  //   return this.httpClient.delete(`${environment.apiUrl}/recipient/v1/recipients/${recipientId}`);
  // }

  // mergeCustomers(recipientId: Customer.Id, body: Customer.Id[]) {
  //   return this.httpClient.post(`${environment.apiUrl}/recipient/v1/recipients/${recipientId}/merge`, body);
  // }

}
