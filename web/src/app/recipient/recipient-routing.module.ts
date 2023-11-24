import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipientHomeComponent } from 'src/app/recipient/recipient-home/recipient-home.component';
import { recipientListResolver } from 'src/app/shared/resolvers';

const routes: Routes = [
  {
    path: '',
    component: RecipientHomeComponent,
    resolve: {
      recipients: recipientListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipientRoutingModule { }
