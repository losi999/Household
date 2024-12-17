import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Project } from '@household/shared/types/types';
import { Store } from '@ngrx/store';
import { CatalogSubmenuComponent, CatalogSubmenuData, CatalogSubmenuResult } from '@household/web/app/shared/catalog-submenu/catalog-submenu.component';
import { selectProjectIsInProgress } from '@household/web/state/progress/progress.selector';
import { Observable } from 'rxjs';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-project-list-item',
  templateUrl: './project-list-item.component.html',
  styleUrls: ['./project-list-item.component.scss'],
  standalone: false,
})
export class ProjectListItemComponent implements OnInit {
  @Input() project: Project.Response;

  constructor(
    private store: Store,
    private bottomSheet: MatBottomSheet) { }

  isDisabled: Observable<boolean>;

  ngOnInit(): void {
    this.isDisabled = this.store.select(selectProjectIsInProgress(this.project.projectId));
  }

  delete() {
    this.store.dispatch(dialogActions.deleteProject(this.project));
  }

  edit() {
    this.store.dispatch(dialogActions.updateProject(this.project));
  }

  merge() {
    this.store.dispatch(dialogActions.mergeProjects(this.project));
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
