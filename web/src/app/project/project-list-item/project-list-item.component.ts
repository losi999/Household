import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Project } from '@household/shared/types/types';
import { ProjectService } from 'src/app/project/project.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from 'src/app/shared/dialog.service';

@Component({
  selector: 'household-project-list-item',
  templateUrl: './project-list-item.component.html',
  styleUrls: ['./project-list-item.component.scss'],
})
export class ProjectListItemComponent {
  @Input() project: Project.Response;
  @Input() projects: Project.Response[];
  constructor(
    private projectService: ProjectService,
    private dialogService: DialogService,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    this.dialogService.openDeleteProjectDialog(this.project).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.projectService.deleteProject(this.project.projectId);
        }
      });
  }

  edit() {
    this.dialogService.openEditProjectDialog(this.project);
  }

  merge() {
    this.dialogService.openMergeProjectsDialog(this.project, this.projects);
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.project.name,
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
        case 'merge': this.merge(); break;
      }
    });
  }
}
