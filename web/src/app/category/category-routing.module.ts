import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryHomeComponent } from 'src/app/category/category-home/category-home.component';
import { CategoryListResolver } from 'src/app/resolvers/category-list.resolver';

const routes: Routes = [
  {
    path: '',
    component: CategoryHomeComponent,
    resolve: {
      categories: CategoryListResolver,
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CategoryRoutingModule { }
