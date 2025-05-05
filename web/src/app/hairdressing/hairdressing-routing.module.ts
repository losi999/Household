import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HairdressingIncomeComponent } from '@household/web/app/hairdressing/hairdressing-income/hairdressing-income.component';

const routes: Routes = [
  {
    path: 'income',
    component: HairdressingIncomeComponent,
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
