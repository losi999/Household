import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategorySelectDialog } from './category-select-dialog';

describe.skip('CategorySelectDialog', () => {
  let component: CategorySelectDialog;
  let fixture: ComponentFixture<CategorySelectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategorySelectDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CategorySelectDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
