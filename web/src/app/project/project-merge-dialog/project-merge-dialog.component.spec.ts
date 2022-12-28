import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectMergeDialogComponent } from './project-merge-dialog.component';

describe('ProjectMergeDialogComponent', () => {
  let component: ProjectMergeDialogComponent;
  let fixture: ComponentFixture<ProjectMergeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectMergeDialogComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectMergeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
