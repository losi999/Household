import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';
import { ProjectService } from 'src/app/project/project.service';

export type ProjectMergeDialogData = {
  projects: Project.Response[];
  targetProjectId: Project.Id;
};

@Component({
  selector: 'app-project-merge-dialog',
  templateUrl: './project-merge-dialog.component.html',
  styleUrls: ['./project-merge-dialog.component.scss'],
})
export class ProjectMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceProjects: FormControl<Project.Id[]>
  }>;

  constructor(private dialogRef: MatDialogRef<ProjectMergeDialogComponent, void>,
    private projectService: ProjectService,
    @Inject(MAT_DIALOG_DATA) public data: ProjectMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProjects: new FormControl(null),
    });
  }

  save() {
    this.projectService.mergeProjects(this.data.targetProjectId, this.form.value.sourceProjects);

    this.dialogRef.close();
  }
}
