import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GridConfigurationComponent } from './grid-configuration.component';

describe('GridConfigurationComponent', () => {
  let component: GridConfigurationComponent;
  let fixture: ComponentFixture<GridConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GridConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GridConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
