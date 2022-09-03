import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTeamDialogListComponent } from './document-team-dialog-list.component';

describe('DocumentTeamDialogListComponent', () => {
  let component: DocumentTeamDialogListComponent;
  let fixture: ComponentFixture<DocumentTeamDialogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentTeamDialogListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTeamDialogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
