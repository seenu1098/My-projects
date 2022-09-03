import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTeamComponent } from './document-team.component';

describe('DocumentTeamComponent', () => {
  let component: DocumentTeamComponent;
  let fixture: ComponentFixture<DocumentTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentTeamComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
