import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { Project } from '@household/shared/types/types';
import { ProjectListItemComponent } from '@household/web/app/project/project-list-item/project-list-item.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  imports: [
    NgxSkeletonLoaderModule,
    MatListModule,
    ProjectListItemComponent,
  ],
  selector: 'household-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent {
  @Input() projects: Project.Response[];

  constructor() { }
}
