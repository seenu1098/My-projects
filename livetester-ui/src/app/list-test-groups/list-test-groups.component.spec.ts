import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListTestGroupsComponent } from './list-test-groups.component';

describe('ListTestGroupsComponent', () => {
  let component: ListTestGroupsComponent;
  let fixture: ComponentFixture<ListTestGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListTestGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListTestGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
