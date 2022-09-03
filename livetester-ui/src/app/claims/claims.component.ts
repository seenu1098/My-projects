import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { ClaimVO, TemplateVO, TestGroupVO, TestGroupCaseVO, ClaimEntityVO, DuplicateClaimVO } from '../../shared/vo/claim-vo';
import { CreateTemplateComponent } from '../create-template/create-template.component';

import { LivetestService } from '../../shared/service/livetest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationDialogBoxComponent } from '../confirmation-dialog-box/confirmation-dialog-box.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css']
})
export class ClaimsComponent implements OnInit {
  templatelist: TemplateVO[];
  testcaseGroup: TestGroupVO[];
  claimEntityVO = new ClaimEntityVO();
  claimTestGroupVo = new TestGroupCaseVO();
  duplicateClaimVO = new DuplicateClaimVO();

  claimVO: ClaimVO;
  claim: FormGroup;

  editing = false;
  testCaseEdit = false;
  isShowTemplate = false;
  isShown = false;
  isBackList = false;
  saveduplicate = false;

  claimId: number;
  responseMsg = '';
  @ViewChild('templateInput', { static: false })
  templateInput: CreateTemplateComponent;

  constructor(private service: LivetestService, private fb: FormBuilder, private route: ActivatedRoute,
    private dialog: MatDialog, private router: Router, private snackBar: MatSnackBar, ) {
    this.service.getTemplateNames().subscribe(data => {
      this.templatelist = data;
    });

    this.service.getTestCaseGroup().subscribe(data => {
      this.testcaseGroup = data;
    });


  }

  ngOnInit() {
    this.claim = this.fb.group({
      templateName: [{ value: this.claimTestGroupVo.templateId, disabled: this.editing }, Validators.required],
      claimName: [{ value: this.claimTestGroupVo.claimName, disabled: this.editing }, Validators.required],
      claimTestGroup: [[], Validators.required],

    });

    this.route.paramMap.subscribe(params => {
      if (params.get('id') != null) {
        this.claimId = +params.get('id');
        this.service.getClaimDetail(this.claimId).subscribe(result => {
          this.claimEntityVO = result;
          const testcaseGroup = [];
          for (let i = 0; i < this.claimEntityVO.testcaseGroups.length; i++) {
            testcaseGroup.push(this.claimEntityVO.testcaseGroups[i].id);
          }

          this.claim.controls['templateName'].setValue(this.claimEntityVO.templateId.toString());
          this.claim.controls['claimName'].setValue(this.claimEntityVO.testCaseName);
          this.claim.controls['claimTestGroup'].setValue(testcaseGroup);


          this.claimTestGroupVo.templateId = this.claimEntityVO.templateId;
          this.claimTestGroupVo.claimName = this.claimEntityVO.testCaseName;
          this.claimTestGroupVo.claimTestcaseGroupName = testcaseGroup.toString();

        });
        this.editing = true;
        this.isShown = false;
        this.isBackList = true;
        this.testCaseEdit = true;
      }
    });

  }

  getTemplate() {
    this.claimTestGroupVo.templateId = this.claim.value.templateName;
    this.claimTestGroupVo.claimName = this.claim.value.claimName;
    const arrclaimTestGroup = this.claim.get('claimTestGroup').value;
    this.claimTestGroupVo.claimTestcaseGroupName = arrclaimTestGroup.join(', ');


    this.templateInput.loadUsingTemplateId(this.claimTestGroupVo.templateId, this.claimTestGroupVo, 0);
    this.isShown = true;
    this.isBackList = false;
    this.templateInput.userAccess = true;
  }

  showTemplateButton($event) {
    this.isShowTemplate = true;
  }

  focusOutForFormElement(type: string, $event: any) {
    if (type === 'claimName') {
      this.claimTestGroupVo.claimName = this.claim.value.claimName;
    } else if (type === 'templateName') {
      if (this.claimTestGroupVo.templateId !== this.claim.value.templateName) {
        this.isShown = false;
      }

      this.claimTestGroupVo.templateId = this.claim.value.templateName;
    } else if (type === 'claimTestGroup') {
      this.claimTestGroupVo.claimTestcaseGroupName = this.claim.get('claimTestGroup').value.join(',');
    }

    this.templateInput.updateTestcaseGroupDetails(this.claimTestGroupVo);
  }

  editClaim() {
    this.editing = true;
    this.testCaseEdit = true;
    this.saveduplicate = false;
    this.templateInput.loadUsingTemplateId(this.claimEntityVO.templateId, this.claimTestGroupVo, this.claimId);
    this.isShown = true;
  }
  saveduplicateClaim(userForm: NgForm) {

    this.editing = true;
    this.testCaseEdit = false;
    this.isBackList = true;
    this.saveduplicate = true;
    this.isShown = false;
    if (userForm.dirty && userForm.valid) {
      this.duplicateClaimVO.claimId = this.claimId;
      this.duplicateClaimVO.testCaseName = this.claim.get('claimName').value;
      const arrclaimTestGroup = this.claim.get('claimTestGroup').value;
      const testCaseGroups = [];
      for (let i = 0; i < arrclaimTestGroup.length; i++) {
        const groupVo = new TestGroupVO();
        groupVo.id = parseInt(arrclaimTestGroup[i], 10);
        testCaseGroups.push(groupVo);
      }
      this.duplicateClaimVO.testcaseGroups = testCaseGroups;
      this.service.saveDuplicateClaim(this.duplicateClaimVO).subscribe(result => {
        this.responseMsg = result.response;
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: result.response,
        });
        userForm.resetForm();
        this.editing = false;
        this.testCaseEdit = false;
        this.router.navigate(['list-claims']);
      });
    }
  }
  duplicateClaim() {
    this.editing = true;
    this.testCaseEdit = false;
    this.isBackList = true;
    this.saveduplicate = true;
    this.isShown = false;
    this.claim.get('claimName').setValue('');
  }
  deleteClaim(userForm: NgForm) {
    this.route.paramMap.subscribe(params => {
      if (params.get('id') != null) {
        const claimId = +params.get('id');
        const dialogRef = this.dialog.open(ConfirmationDialogBoxComponent, {
          width: '250px',
          data: {
            id: claimId,
            serviceName: 'claims',
            displayText: 'Claim'
          }
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            userForm.resetForm();
            this.router.navigate(['list-claims']);
          }
        });
      }
    });

  }
}
