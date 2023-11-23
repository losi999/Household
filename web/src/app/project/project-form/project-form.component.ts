import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';
import { ProjectService } from 'src/app/project/project.service';

export type ProjectFormData = Project.Response;

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
})
export class ProjectFormComponent implements OnInit {
  form: FormGroup;
  constructor(private dialogRef: MatDialogRef<ProjectFormComponent, void>,
    private projectService: ProjectService,
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
      }
      if (this.project) {
        this.projectService.updateProject(this.project.projectId, request)
      } else {
        this.projectService.createProject(request)
      }

      this.dialogRef.close();
    }
  }
}
