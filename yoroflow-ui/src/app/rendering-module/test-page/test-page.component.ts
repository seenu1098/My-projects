import { Component, OnInit } from '@angular/core';
import { PageService } from '../shared/service/page-service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RenderingConfirmDialogBoxComponent } from '../rendering-confirm-dialog-box-component/rendering-confirm-dialog-box-component.component';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css']
})
export class TestPageComponent implements OnInit {

  pageNames: any[];
  constructor(private pageService: PageService, private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.pageService.getPageNames().subscribe(
      data => {
        this.pageNames = data;
      }
    );
  }

  openDialog(page: any) {
    const newPage = {
      'id': page.pageId, 'target': 'test-page', 'pageName': page.pageName
    };
    this.dialog.open(RenderingConfirmDialogBoxComponent, {
      width: '250px',
      data: newPage
    });
  }
}
