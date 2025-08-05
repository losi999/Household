import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsUsersListItemComponent } from './settings-users-list-item.component';

describe('SettingsUsersListItemComponent', () => {
  let component: SettingsUsersListItemComponent;
  let fixture: ComponentFixture<SettingsUsersListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsUsersListItemComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingsUsersListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
