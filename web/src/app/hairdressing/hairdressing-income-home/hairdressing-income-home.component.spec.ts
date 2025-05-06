import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingIncomeHomeComponent } from './hairdressing-income-home.component';

describe('HairdressingIncomeComponent', () => {
  let component: HairdressingIncomeHomeComponent;
  let fixture: ComponentFixture<HairdressingIncomeHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingIncomeHomeComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingIncomeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
