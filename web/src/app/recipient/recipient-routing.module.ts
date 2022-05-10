import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipientHomeComponent } from 'src/app/recipient/recipient-home/recipient-home.component';
import { RecipientListResolver } from 'src/app/resolvers/recipient-list.resolver';

const routes: Routes = [
  {
    path: '',
    component: RecipientHomeComponent,
    resolve: {
      recipients: RecipientListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipientRoutingModule { }
