import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductHomeComponent } from 'src/app/product/product-home/product-home.component';
import { productListResolver } from 'src/app/shared/resolvers';

const routes: Routes = [
  {
    path: '',
    component: ProductHomeComponent,
    resolve: {
      categories: productListResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductRoutingModule { }
