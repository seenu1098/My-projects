import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboarddocumentsComponent } from './taskboard-documents.component';

describe('TaskboarddocumentsComponent', () => {
  let component: TaskboarddocumentsComponent;
  let fixture: ComponentFixture<TaskboarddocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskboarddocumentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskboarddocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
