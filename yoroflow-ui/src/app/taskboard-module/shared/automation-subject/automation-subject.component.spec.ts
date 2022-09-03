import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationSubjectComponent } from './automation-subject.component';

describe('AutomationSubjectComponent', () => {
  let component: AutomationSubjectComponent;
  let fixture: ComponentFixture<AutomationSubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationSubjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationSubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
