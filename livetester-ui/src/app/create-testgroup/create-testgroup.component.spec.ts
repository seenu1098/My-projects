import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTestgroupComponent } from './create-testgroup.component';

describe('CreateTestgroupComponent', () => {
  let component: CreateTestgroupComponent;
  let fixture: ComponentFixture<CreateTestgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTestgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTestgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
