import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationTaskboardComponent } from './automation-taskboard.component';

describe('AutomationTaskboardComponent', () => {
  let component: AutomationTaskboardComponent;
  let fixture: ComponentFixture<AutomationTaskboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationTaskboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationTaskboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
