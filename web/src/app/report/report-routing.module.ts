import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportHomeComponent } from '@household/web/app/report/report-home/report-home.component';

const routes: Routes = [
  {
    path: '',
    component: ReportHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule { }
