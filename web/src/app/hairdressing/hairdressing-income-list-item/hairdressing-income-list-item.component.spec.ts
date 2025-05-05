import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HairdressingIncomeListItemComponent } from './hairdressing-income-list-item.component';

describe('HairdressingIncomeListItemComponent', () => {
  let component: HairdressingIncomeListItemComponent;
  let fixture: ComponentFixture<HairdressingIncomeListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HairdressingIncomeListItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(HairdressingIncomeListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
