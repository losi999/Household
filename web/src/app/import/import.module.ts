import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportHomeComponent } from './import-home/import-home.component';
import { ImportRoutingModule } from '@household/web/app/import/import-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ImportFileUploadFormComponent } from './import-file-upload-form/import-file-upload-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    ImportHomeComponent,
    ImportFileUploadFormComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarComponent,
    MatButtonModule,
    MatIconModule,
    ImportRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
  ],
})
export class ImportModule { }
