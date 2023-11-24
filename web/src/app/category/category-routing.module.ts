import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryHomeComponent } from 'src/app/category/category-home/category-home.component';
import { categoryListResolver } from 'src/app/shared/resolvers';

const routes: Routes = [
  {
    path: '',
    component: CategoryHomeComponent,
    resolve: {
      categories: categoryListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule { }
