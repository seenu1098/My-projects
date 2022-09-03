import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PayHistoryService } from './pay-history.service';
import * as FileSaver from 'file-saver';
@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  @Input() id: any;
  customerPaymentVO: any[] = [];
  @Output() previous: EventEmitter<any> = new EventEmitter<any>();
  constructor(private payHistoryService: PayHistoryService) { }
  displayedColumns: string[] = ['isPaymentSucceed', 'paymentDate', 'paymentAmount', 'paymentMethod', 'receipt'];
  ngOnInit(): void {
    this.getPayHistory(this.id);
  }

  getPayHistory(id) {
    this.payHistoryService.getPayHistory(id).subscribe(data => {
      this.customerPaymentVO = data;
    });
  }

  downloadFile(id) {
    this.payHistoryService.downloadFile(id).subscribe(data => {
      const file = new Blob([data], { type: 'application/pdf' });
      FileSaver.saveAs(file, 'Receipt');
    });
  }

  goBack() {
    this.previous.emit(true);
  }
}
