import { Component, effect, inject, input, model } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { IconText, ProgressStore, SelectionStore } from '@household/shared-ui';
import { Responses } from '@household/shared/types/responses';
import { projectEvents } from '@household/state/project/project-events';
import { injectDispatch } from '@ngrx/signals/events';

@Component({
  imports: [
    IconText,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'household-project-selector',
  styleUrl: './project-selector.scss',
  templateUrl: './project-selector.html',
})
export class ProjectSelector implements FormValueControl<Responses.Project> {
  private readonly projectEvents = injectDispatch(projectEvents);
  private readonly selectionStore = inject(SelectionStore);
  readonly progressStore = inject(ProgressStore);
  private selectionId: string;

  value = model<Responses.Project>();
  label = input<string>();
  required = input(false);
  items = input<Responses.Project[]>([]);

  constructor() {
    effect(() => {
      const selectedProject = this.selectionStore.selectedItems()[this.selectionId] as Responses.Project;

      if (selectedProject) {
        this.value.set(selectedProject);
      }
    });
  }

  onRemoveProject() {
    this.value.set(null);
  }

  onSelectProject() {
    this.selectionId = crypto.randomUUID();
    this.projectEvents.selectProject({
      selectionId: this.selectionId,
      projects: this.items(),
    });
  }
}
