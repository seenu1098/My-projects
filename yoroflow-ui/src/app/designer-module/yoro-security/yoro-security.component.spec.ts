import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { YoroSecurityComponent } from './yoro-security.component';

describe('YoroSecurityComponent', () => {
  let component: YoroSecurityComponent;
  let fixture: ComponentFixture<YoroSecurityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YoroSecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YoroSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
