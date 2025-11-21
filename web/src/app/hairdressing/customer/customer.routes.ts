import { Routes } from '@angular/router';
import { CustomerDetailsComponent } from '@household/web/app/hairdressing/customer/customer-details/customer-details.component';
import { CustomerHomeComponent } from '@household/web/app/hairdressing/customer/customer-home/customer-home.component';

export const routes: Routes = [
  {
    path: '',
    component: CustomerHomeComponent,
  },
  {
    path: ':customerId',
    component: CustomerDetailsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
