import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MenuConfigurationComponent } from './menu-configuration.component';

describe('MenuConfigurationComponent', () => {
  let component: MenuConfigurationComponent;
  let fixture: ComponentFixture<MenuConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
