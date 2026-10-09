import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { Responses } from '@household/shared/types/responses';
import { projectEvents } from '@household/state/project/project-events';
import { ProjectStore } from '@household/state/project/project-store';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    MatButtonModule,
    MatListModule,
  ],
  selector: 'household-project-list-item',
  styleUrl: './project-list-item.scss',
  templateUrl: './project-list-item.html',
})
export class ProjectListItem {
  project = input.required<Responses.Project>();
  private projectEvents = injectDispatch(projectEvents);
  private readonly projectStore = inject(ProjectStore);
  
  isDisabled = computed(() => {
    return this.projectStore.isInProgress().includes(this.project().projectId);
  });
  
  onShowMenu() {
    this.projectEvents.openProjectListItemSubmenu(this.project());
  }
}
