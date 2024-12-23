import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryHomeComponent } from './category-home/category-home.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryListItemComponent } from './category-list-item/category-list-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryRoutingModule } from '@household/web/app/category/category-routing.module';
import { CategoryFormComponent } from './category-form/category-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryMergeDialogComponent } from './category-merge-dialog/category-merge-dialog.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CategoryAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/category-autocomplete-input/category-autocomplete-input.component';

@NgModule({
  declarations: [
    CategoryHomeComponent,
    CategoryListComponent,
    CategoryListItemComponent,
    CategoryFormComponent,
    CategoryMergeDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    CategoryRoutingModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatRadioModule,
    ToolbarComponent,
    CategoryAutocompleteInputComponent,
    ClearableInputComponent,
    NgxSkeletonLoaderModule,
  ],
})
export class CategoryModule { }
