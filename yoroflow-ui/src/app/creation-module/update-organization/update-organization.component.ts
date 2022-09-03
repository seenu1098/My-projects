import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/service/user-service';
import { UserVO } from '../shared/vo/user-vo';
import { CreateOrganizationService } from '../create-organization/create-organization.service';
import { CustomerVO } from '../create-organization/customer-vo';

@Component({
  selector: 'lib-update-organization',
  templateUrl: './update-organization.component.html',
  styleUrls: ['./update-organization.component.css']
})
export class UpdateOrganizationComponent implements OnInit {

  constructor(private orgservice: CreateOrganizationService) { }
  customerVO = new CustomerVO();
  showOrg = false;
  adminOrgUpdate = false;
  yoroAdmin = false;
  ngOnInit(): void {
    this.orgservice.getOrganizationInfo().subscribe(data => {
      this.customerVO = data;
      this.showOrg = true;
    });
    if (window.location.href.includes('update-organization') || !window.location.href.includes('user')) {
      this.adminOrgUpdate = true;
      if (window.location.href.includes('update-org') && !window.location.href.includes('update-organization')) {
        this.yoroAdmin = true;
      }
    } else {
      this.adminOrgUpdate = false;
    }
  }
}
