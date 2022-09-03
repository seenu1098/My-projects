import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoadControlsComponent } from './load-controls.component';

describe('LoadControlsComponent', () => {
  let component: LoadControlsComponent;
  let fixture: ComponentFixture<LoadControlsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
