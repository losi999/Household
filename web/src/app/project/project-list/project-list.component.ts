import { Component, Input } from '@angular/core';
import { Project } from '@household/shared/types/types';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent {
  @Input() projects: Project.Response[];

  constructor() { }
}
