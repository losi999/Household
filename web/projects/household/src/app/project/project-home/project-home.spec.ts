import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectHome } from './project-home';

describe.skip('ProjectHome', () => {
  let component: ProjectHome;
  let fixture: ComponentFixture<ProjectHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectHome],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProjectHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
