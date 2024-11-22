import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Project } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { projectApiActions } from '@household/web/state/project/project.actions';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { DialogService } from '@household/web/app/shared/dialog.service';
import { selectProjectIsInProgress } from '@household/web/state/progress/progress.selector';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-project-list-item',
  templateUrl: './project-list-item.component.html',
  styleUrls: ['./project-list-item.component.scss'],
  standalone: false,
})
export class ProjectListItemComponent implements OnInit {
  @Input() project: Project.Response;

  constructor(
    private dialogService: DialogService,
    private store: Store,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectProjectIsInProgress(this.project.projectId));
  }

  delete() {
    this.dialogService.openDeleteProjectDialog(this.project).afterClosed()
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this.store.dispatch(projectApiActions.deleteProjectInitiated({
            projectId: this.project.projectId,
          }));
        }
      });
  }

  edit() {
    this.dialogService.openEditProjectDialog(this.project);
  }

  merge() {
    this.dialogService.openMergeProjectsDialog(this.project);
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
