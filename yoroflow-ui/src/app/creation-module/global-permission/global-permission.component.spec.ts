import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalPermissionComponent } from './global-permission.component';

describe('GlobalPermissionComponent', () => {
  let component: GlobalPermissionComponent;
  let fixture: ComponentFixture<GlobalPermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalPermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
