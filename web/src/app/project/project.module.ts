import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectHomeComponent } from './project-home/project-home.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListItemComponent } from './project-list-item/project-list-item.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectRoutingModule } from 'src/app/project/project-routing.module';
import { ProjectFormComponent } from './project-form/project-form.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { ProjectMergeDialogComponent } from './project-merge-dialog/project-merge-dialog.component';
import { ToolbarComponent } from 'src/app/shared/toolbar/toolbar.component';
import { ClearableInputComponent } from 'src/app/shared/clearable-input/clearable-input.component';

@NgModule({
  declarations: [
    ProjectHomeComponent,
    ProjectListComponent,
    ProjectListItemComponent,
    ProjectFormComponent,
    ProjectMergeDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    ProjectRoutingModule,
    MatListModule,
    MatBottomSheetModule,
    MatDialogModule,
    ToolbarComponent,
    ClearableInputComponent,
  ],
})
export class ProjectModule { }
