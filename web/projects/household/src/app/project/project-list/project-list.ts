import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { ProjectListItem } from '@household/app/project/project-list-item/project-list-item';
import { Responses } from '@household/shared/types/responses';

@Component({
  imports: [
    ProjectListItem,
    MatListModule,
  ],
  selector: 'household-project-list',
  styleUrl: './project-list.scss',
  templateUrl: './project-list.html',
})
export class ProjectList {
  projects = input.required<Responses.Project[]>();
}
