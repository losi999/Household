import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';

export type ProjectMergeDialogData = Project.Response[];
export type ProjectMergeDialogResult = Project.Id[];

@Component({
  selector: 'app-project-merge-dialog',
  templateUrl: './project-merge-dialog.component.html',
  styleUrls: ['./project-merge-dialog.component.scss'],
})
export class ProjectMergeDialogComponent implements OnInit {
  form: FormGroup;

  constructor(private dialogRef: MatDialogRef<ProjectMergeDialogComponent, ProjectMergeDialogResult>,
    @Inject(MAT_DIALOG_DATA) public projects: ProjectMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProjects: new FormControl(null),
    });
  }

  save() {
    this.dialogRef.close(this.form.value.sourceProjects);
  }
}
