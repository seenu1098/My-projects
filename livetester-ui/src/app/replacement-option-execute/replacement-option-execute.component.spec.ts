import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplacementOptionExecuteComponent } from './replacement-option-execute.component';

describe('ReplacementOptionExecuteComponent', () => {
  let component: ReplacementOptionExecuteComponent;
  let fixture: ComponentFixture<ReplacementOptionExecuteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplacementOptionExecuteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplacementOptionExecuteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
