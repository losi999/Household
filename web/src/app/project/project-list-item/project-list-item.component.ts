import { Component, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '@household/shared/types/types';
import { ProjectFormComponent, ProjectFormData, ProjectFormResult } from 'src/app/project/project-form/project-form.component';
import { ProjectService } from 'src/app/project/project.service';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from 'src/app/shared/catalog-submenu/catalog-submenu.component';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-project-list-item',
  templateUrl: './project-list-item.component.html',
  styleUrls: ['./project-list-item.component.scss'],
})
export class ProjectListItemComponent {
  @Input() project: Project.Response;
  constructor(
    private projectService: ProjectService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet) { }

  delete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Törölni akarod ezt a projektet?',
        content: this.project.name,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteProject(this.project.projectId);
      }
    });
  }

  edit() {
    const dialogRef = this.dialog.open<ProjectFormComponent, ProjectFormData, ProjectFormResult>(ProjectFormComponent, {
      data: this.project, 
    });

    dialogRef.afterClosed().subscribe((values) => {
      if (values) {
        this.projectService.updateProject(this.project.projectId, values);
      }
    });
  }

  showMenu() {
    const bottomSheetRef = this.bottomSheet.open<CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult>(CatalogSubmenuComponent, {
      data: this.project.name, 
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case 'delete': this.delete(); break;
        case 'edit': this.edit(); break;
      }
    });
  }
}
