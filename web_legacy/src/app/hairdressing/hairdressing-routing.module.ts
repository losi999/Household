import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HairdressingIncomeHomeComponent } from '@household/web/app/hairdressing/hairdressing-income-home/hairdressing-income-home.component';

const routes: Routes = [
  {
    path: 'income',
    component: HairdressingIncomeHomeComponent,
  },
  {
    path: '**',
    redirectTo: 'income',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HairdressingRoutingModule { }
