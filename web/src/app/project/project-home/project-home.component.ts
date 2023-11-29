import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '@household/shared/types/types';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService } from 'src/app/project/project.service';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'app-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss'],
})
export class ProjectHomeComponent implements OnInit, OnDestroy {
  projects: Project.Response[];
  private destroyed = new Subject();

  constructor(private activatedRoute: ActivatedRoute, private projectService: ProjectService, private dialogService: DialogService) { }

  ngOnDestroy(): void {
    this.destroyed.next(undefined);
    this.destroyed.complete();
  }

  ngOnInit(): void {
    this.projects = this.activatedRoute.snapshot.data.projects;

    this.projectService.collectionUpdated.pipe(takeUntil(this.destroyed)).subscribe((event) => {
      switch (event.action) {
        case 'deleted': {
          this.projects = this.projects.filter(p => p.projectId !== event.projectId);
        } break;
      }

      this.projectService.listProjects().subscribe({
        next: (projects) => {
          this.projects = projects;
        },
      });
    });
  }

  create() {
    this.dialogService.openCreateProjectDialog();
  }
}
