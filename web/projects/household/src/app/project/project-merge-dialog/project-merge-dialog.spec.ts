import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectMergeDialog } from './project-merge-dialog';

describe.skip('ProjectMergeDialog', () => {
  let component: ProjectMergeDialog;
  let fixture: ComponentFixture<ProjectMergeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectMergeDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectMergeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
