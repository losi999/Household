import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportHomeComponent } from 'src/app/report/report-home/report-home.component';
import { accountListResolver, categoryListResolver, projectListResolver, recipientListResolver } from 'src/app/shared/resolvers';

const routes: Routes = [
  {
    path: '',
    component: ReportHomeComponent,
    resolve: {
      accounts: accountListResolver,
      projects: projectListResolver,
      categories: categoryListResolver,
      recipients: recipientListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportRoutingModule { }
