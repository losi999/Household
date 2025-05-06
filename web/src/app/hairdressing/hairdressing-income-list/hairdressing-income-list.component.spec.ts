import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingIncomeListComponent } from './hairdressing-income-list.component';

describe('HairdressingIncomeListComponent', () => {
  let component: HairdressingIncomeListComponent;
  let fixture: ComponentFixture<HairdressingIncomeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingIncomeListComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingIncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
