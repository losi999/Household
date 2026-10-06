import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDialog } from './project-dialog';

describe.skip('ProjectDialog', () => {
  let component: ProjectDialog;
  let fixture: ComponentFixture<ProjectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
