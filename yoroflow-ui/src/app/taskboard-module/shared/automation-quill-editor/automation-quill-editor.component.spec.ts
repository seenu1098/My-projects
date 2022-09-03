import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationQuillEditorComponent } from './automation-quill-editor.component';

describe('AutomationQuillEditorComponent', () => {
  let component: AutomationQuillEditorComponent;
  let fixture: ComponentFixture<AutomationQuillEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationQuillEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationQuillEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
