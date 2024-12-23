import { Component, Input } from '@angular/core';
import { Project } from '@household/shared/types/types';

@Component({
  selector: 'household-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  standalone: false,
})
export class ProjectListComponent {
  @Input() projects: Project.Response[];

  constructor() { }
}
