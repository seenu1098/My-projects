import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UppyComponentComponent } from './uppy-component.component';

describe('UppyComponentComponent', () => {
  let component: UppyComponentComponent;
  let fixture: ComponentFixture<UppyComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UppyComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UppyComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
