import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerDetailsComponent } from '@household/web/app/customer/customer-details/customer-details.component';
import { CustomerHomeComponent } from '@household/web/app/customer/customer-home/customer-home.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerRoutingModule { }
