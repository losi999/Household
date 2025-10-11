import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PriceListComponent } from '@household/web/app/hairdressing/price/price-list/price-list.component';

const routes: Routes = [
  {
    path: '',
    component: PriceListComponent,
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
export class PriceRoutingModule { }
