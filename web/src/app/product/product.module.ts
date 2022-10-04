import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHomeComponent } from './product-home/product-home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductRoutingModule } from 'src/app/product/product-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { ProductListCategoryItemComponent } from './product-list-category-item/product-list-category-item.component';
import { MatListModule } from '@angular/material/list';
import { ProductListProductItemComponent } from './product-list-product-item/product-list-product-item.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    ProductHomeComponent,
    ProductListComponent,
    ProductFormComponent,
    ProductListCategoryItemComponent,
    ProductListProductItemComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    ProductRoutingModule,
    MatSelectModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatExpansionModule,
    MatListModule,
  ],
})
export class ProductModule { }
