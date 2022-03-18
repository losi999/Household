import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';

export type ProjectFormData = Project.Response;
export type ProjectFormResult = Project.Request;

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss']
})
export class ProjectFormComponent implements OnInit {
  form: FormGroup;
  constructor(private dialogRef: MatDialogRef<ProjectFormComponent, ProjectFormResult>,
    @Inject(MAT_DIALOG_DATA) public project: ProjectFormData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(this.project?.name, [Validators.required]),
      description: new FormControl(this.project?.description),
    })
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        name: this.form.value.name,
        description: this.form.value.description ?? undefined,
      });
    }
  }
}
