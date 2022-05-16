import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryHomeComponent } from './category-home/category-home.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CategoryListItemComponent } from './category-list-item/category-list-item.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryRoutingModule } from 'src/app/category/category-routing.module';
import { CategoryFormComponent } from './category-form/category-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    CategoryHomeComponent,
    CategoryListComponent,
    CategoryListItemComponent,
    CategoryFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatButtonModule,
    MatIconModule,
    CategoryRoutingModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatRadioModule,
  ],
})
export class CategoryModule { }
