import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { ProjectStore } from '@household/state/project/project-store';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

export type ProjectMergeDialogData = Responses.Project;
export type ProjectMergeDialogResult = {
  targetProjectId: Api.Project.Id;
  sourceProjectIds: Api.Project.Id[];
};

@Component({
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatIconModule,
  ],
  styleUrl: './project-merge-dialog.scss',
  templateUrl: './project-merge-dialog.html',
})
export class ProjectMergeDialog {
  private dialogRef = inject<MatDialogRef<ProjectMergeDialog, ProjectMergeDialogResult>>(MatDialogRef);
  public project = inject<ProjectMergeDialogData>(MAT_DIALOG_DATA);
  private projectStore = inject(ProjectStore);

  selectedProjects = signal<Responses.Project[]>([]);
  selectedProjectIds = computed(() => {
    return this.selectedProjects().map(p => p.projectId);
  });

  projects = computed(() => {
    return this.projectStore.projectList().filter(p => p.projectId !== this.project.projectId && !this.selectedProjectIds().includes(p.projectId));
  });

  onAddProject(project: Responses.Project) {
    this.selectedProjects.update((previous) => {
      return [
        ...previous,
        project,
      ];
    });
  }

  onRemoveProject(project: Responses.Project) {
    this.selectedProjects.update((previous) => {
      return previous.filter(p => p.projectId !== project.projectId);
    });
  }

  onSave() { 
    if (this.selectedProjectIds().length > 0) {
      this.dialogRef.close({
        sourceProjectIds: this.selectedProjectIds(),
        targetProjectId: this.project.projectId,
      });
    }
  }
}
