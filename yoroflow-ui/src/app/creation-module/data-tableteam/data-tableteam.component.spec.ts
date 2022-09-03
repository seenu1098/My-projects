import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableteamComponent } from './data-tableteam.component';

describe('DataTableteamComponent', () => {
  let component: DataTableteamComponent;
  let fixture: ComponentFixture<DataTableteamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataTableteamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableteamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
