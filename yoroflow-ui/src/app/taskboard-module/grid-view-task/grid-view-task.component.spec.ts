import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridViewTaskComponent } from './grid-view-task.component';

describe('GridViewTaskComponent', () => {
  let component: GridViewTaskComponent;
  let fixture: ComponentFixture<GridViewTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridViewTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridViewTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
