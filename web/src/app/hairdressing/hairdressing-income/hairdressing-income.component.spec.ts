import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingIncomeComponent } from './hairdressing-income.component';

describe('HairdressingIncomeComponent', () => {
  let component: HairdressingIncomeComponent;
  let fixture: ComponentFixture<HairdressingIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingIncomeComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
