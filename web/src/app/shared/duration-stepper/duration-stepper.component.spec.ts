import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationStepperComponent } from './duration-stepper.component';

describe.skip('DurationStepperComponent', () => {
  let component: DurationStepperComponent;
  let fixture: ComponentFixture<DurationStepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DurationStepperComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DurationStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
