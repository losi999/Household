import { Component, computed, inject, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { ClearableInput } from '@household/shared-ui';
import { search } from '@household/shared/common/utils';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';
import { ProjectStore } from '@household/state/project/project-store';

export type ProjectSelectDialogData = Searchable<Responses.Project>[];
export type ProjectSelectDialogResult = Responses.Project;

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    ClearableInput,
  ],
  styleUrl: './project-select-dialog.scss',
  templateUrl: './project-select-dialog.html',
})
export class ProjectSelectDialog {
  private dialogRef = inject<MatDialogRef<ProjectSelectDialog, ProjectSelectDialogResult>>(MatDialogRef);
  public data = inject<ProjectSelectDialogData>(MAT_DIALOG_DATA);
  private projectStore = inject(ProjectStore);

  searchValue = model<string>('');

  selectableProjects = computed(() => {
    const projectList = this.data ?? this.projectStore.projectList();

    if (!this.searchValue()) {
      return projectList;
    }

    return projectList.filter((project) => {
      return search(project, this.searchValue());
    });
  });

  onSelect(project: Responses.Project) {
    this.dialogRef.close(project);
  }
}
