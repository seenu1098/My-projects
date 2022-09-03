import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListViewTaskComponent } from './list-view-task.component';

describe('ListViewTaskComponent', () => {
  let component: ListViewTaskComponent;
  let fixture: ComponentFixture<ListViewTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListViewTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListViewTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
