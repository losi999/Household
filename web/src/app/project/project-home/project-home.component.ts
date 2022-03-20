import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Project } from '@household/shared/types/types';
import { Subscription } from 'rxjs';
import { ProjectFormComponent, ProjectFormData, ProjectFormResult } from 'src/app/project/project-form/project-form.component';
import { ProjectService } from 'src/app/project/project.service';

@Component({
  selector: 'app-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.scss']
})
export class ProjectHomeComponent implements OnInit, OnDestroy {
  projects: Project.Response[];
  refreshList: Subscription;

  constructor(private activatedRoute: ActivatedRoute, private projectService: ProjectService, private dialog: MatDialog) { }

  ngOnDestroy(): void {
    this.refreshList.unsubscribe();
  }

  ngOnInit(): void {
    this.projects = this.activatedRoute.snapshot.data.projects;

    this.refreshList = this.projectService.refreshList.subscribe({
      next: () => {
        this.projectService.listProjects().subscribe((projects) => {
          this.projects = projects;
        });
      }
    });
  }

  create() {
    const dialogRef = this.dialog.open<ProjectFormComponent, ProjectFormData, ProjectFormResult>(ProjectFormComponent);

    dialogRef.afterClosed().subscribe({
      next: (values) => {
        if (values) {
          this.projectService.createProject(values);
        }
      }
    })
  }

}
