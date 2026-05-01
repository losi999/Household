import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearableInput } from './clearable-input';

describe('ClearableInput', () => {
  let component: ClearableInput;
  let fixture: ComponentFixture<ClearableInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearableInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearableInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
