import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryInputComponent } from './inventory-input.component';

describe('InventoryInputComponent', () => {
  let component: InventoryInputComponent;
  let fixture: ComponentFixture<InventoryInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryInputComponent ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
