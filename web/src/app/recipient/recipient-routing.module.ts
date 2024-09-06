import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecipientHomeComponent } from '@household/web/app/recipient/recipient-home/recipient-home.component';

const routes: Routes = [
  {
    path: '',
    component: RecipientHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipientRoutingModule { }
