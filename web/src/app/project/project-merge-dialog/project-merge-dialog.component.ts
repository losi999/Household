import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { selectProjects } from '@household/web/state/project/project.selector';

export type ProjectMergeDialogData = Project.Id;

@Component({
  selector: 'household-project-merge-dialog',
  templateUrl: './project-merge-dialog.component.html',
  styleUrls: ['./project-merge-dialog.component.scss'],
  standalone: false,
})
export class ProjectMergeDialogComponent implements OnInit {
  form: FormGroup<{
    sourceProjects: FormControl<Project.Id[]>
  }>;

  projects = this.store.select(selectProjects).pipe(map(projects => projects.filter(p => p.projectId !== this.targetProjectId)));

  constructor(private dialogRef: MatDialogRef<ProjectMergeDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public targetProjectId: ProjectMergeDialogData) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      sourceProjects: new FormControl(null),
    });
  }

  save() {
    this.store.dispatch(projectApiActions.mergeProjectsInitiated({
      sourceProjectIds: this.form.value.sourceProjects,
      targetProjectId: this.targetProjectId,
    }));

    this.dialogRef.close();
  }
}
