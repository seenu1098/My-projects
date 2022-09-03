import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { LivetestService } from 'src/shared/service/livetest.service';
import { ClaimVO } from 'src/shared/vo/claim-vo';


@Component({
  selector: 'app-claim-details-dialog-box',
  templateUrl: './claim-details-dialog-box.component.html',
  styleUrls: ['./claim-details-dialog-box.component.css']
})
export class ClaimDetailsDialogBoxComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ClaimDetailsDialogBoxComponent>, private service: LivetestService,
    @Inject(MAT_DIALOG_DATA) public data: any, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
      this.iconRegistry.addSvgIcon(
        'clear', this.sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/clear.svg')
      );
     }

    dataFetched = false;
    claimVO = new ClaimVO();

    ngOnInit() {
    this.service.getClaimInfo(this.data).subscribe(details => {
      this.claimVO = details;
      this.dataFetched = true;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
