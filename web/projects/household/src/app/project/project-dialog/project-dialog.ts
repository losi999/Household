import { Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ClearableInput } from '@household/shared-ui';
import { toUndefined } from '@household/shared/common/utils';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export type ProjectDialogData = Responses.Project;
export type ProjectDialogResult = Requests.Project;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    ClearableInput,
    FormField,
  ],
  styleUrl: './project-dialog.scss',
  templateUrl: './project-dialog.html',
})
export class ProjectDialog {
  private dialogRef = inject<MatDialogRef<ProjectDialog, ProjectDialogResult>>(MatDialogRef);
  public project = inject<ProjectDialogData>(MAT_DIALOG_DATA);

  projectModel = signal<Requests.Project>({
    name: this.project?.name || '',
    description: this.project?.description || '',
  });
  
  projectForm = form(this.projectModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });

  onSave() {
    Object.values(this.projectForm).forEach(field => {
      field().markAsTouched();
    });

    if (this.projectForm().valid()) {
      this.dialogRef.close({
        name: this.projectForm.name().value(),
        description: toUndefined(this.projectForm.description().value()),
      });
    }
  }
}
