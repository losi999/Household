import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipientListItemComponent } from './recipient-list-item.component';

describe('RecipientListItemComponent', () => {
  let component: RecipientListItemComponent;
  let fixture: ComponentFixture<RecipientListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecipientListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipientListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
