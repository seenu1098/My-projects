import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationAssignedUserComponent } from './automation-assigned-user.component';

describe('AutomationAssignedUserComponent', () => {
  let component: AutomationAssignedUserComponent;
  let fixture: ComponentFixture<AutomationAssignedUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationAssignedUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationAssignedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
