import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { MatButtonModule } from '@angular/material/button';

export type ProjectFormData = Project.Response;

@Component({
  selector: 'household-project-form',
  imports: [
    ReactiveFormsModule,
    ClearableInputComponent,
    MatDialogModule, 
    MatButtonModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  form: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
  }>;
  constructor(private dialogRef: MatDialogRef<ProjectFormComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public project: ProjectFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.project?.name, [Validators.required]),
      description: new FormControl(this.project?.description),
    });
  }

  save() {
    if (this.form.valid) {
      const request: Project.Request = {
        name: this.form.value.name,
        description: this.form.value.description ?? undefined,
      };
      if (this.project) {
        this.store.dispatch(projectApiActions.updateProjectInitiated({
          projectId: this.project.projectId,
          ...request,
        }));
      } else {
        this.store.dispatch(projectApiActions.createProjectInitiated(request));
      }

      this.dialogRef.close();
    }
  }
}
