import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationLayoutPageComponent } from './application-layout-page.component';

describe('ApplicationLayoutPageComponent', () => {
  let component: ApplicationLayoutPageComponent;
  let fixture: ComponentFixture<ApplicationLayoutPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationLayoutPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationLayoutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
