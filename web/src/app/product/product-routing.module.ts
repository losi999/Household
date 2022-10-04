import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductHomeComponent } from 'src/app/product/product-home/product-home.component';
import { ProductListResolver } from 'src/app/resolvers/product-list.resolver';

const routes: Routes = [
  {
    path: '',
    component: ProductHomeComponent,
    resolve: {
      categories: ProductListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule { }
