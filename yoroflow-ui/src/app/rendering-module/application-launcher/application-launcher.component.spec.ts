import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationLauncherComponent } from './application-launcher.component';

describe('ApplicationLauncherComponent', () => {
  let component: ApplicationLauncherComponent;
  let fixture: ComponentFixture<ApplicationLauncherComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationLauncherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
