import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryHomeComponent } from '@household/web/app/category/category-home/category-home.component';

const routes: Routes = [
  {
    path: '',
    component: CategoryHomeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule { }
