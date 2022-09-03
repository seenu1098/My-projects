import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-document-comment',
  templateUrl: './document-comment.component.html',
  styleUrls: ['./document-comment.component.scss']
})
export class DocumentCommentComponent implements OnInit {
  form: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private fb: FormBuilder, private dialogRef: MatDialogRef<DocumentCommentComponent>) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      commentValue: [],
    });
    if (this.data.type === 'edit') {
      this.form.get('commentValue').setValue(this.data.data.comment)
    }
  }
  addTypedComment() {
    if (this.form.get('commentValue').value !== null) {
      this.dialogRef.close({ value: this.form.get('commentValue').value })
    }
  }
  cancel() {
    this.dialogRef.close();
  }
}
