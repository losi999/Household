import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHomeComponent } from './product-home/product-home.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductFormComponent } from './product-form/product-form.component';
import { ProductRoutingModule } from '@household/web/app/product/product-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { ProductListCategoryItemComponent } from './product-list-category-item/product-list-category-item.component';
import { MatListModule } from '@angular/material/list';
import { ProductListProductItemComponent } from './product-list-product-item/product-list-product-item.component';
import { MatSelectModule } from '@angular/material/select';
import { ProductMergeDialogComponent } from './product-merge-dialog/product-merge-dialog.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CategoryAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/category-autocomplete-input/category-autocomplete-input.component';

@NgModule({
  declarations: [
    ProductHomeComponent,
    ProductListComponent,
    ProductFormComponent,
    ProductListCategoryItemComponent,
    ProductListProductItemComponent,
    ProductMergeDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    ProductRoutingModule,
    MatSelectModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatListModule,
    ToolbarComponent,
    CategoryAutocompleteInputComponent,
    ClearableInputComponent,
    NgxSkeletonLoaderModule,
  ],
})
export class ProductModule { }
