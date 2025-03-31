import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportHomeComponent } from '@household/web/app/import/import-home/import-home.component';

const routes: Routes = [
  {
    path: '',
    component: ImportHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImportRoutingModule { }
