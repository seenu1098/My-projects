import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MenuService } from '../shared/service/menu.service';
import { MenuVO } from '../shared/vo/menu-vo';
import { Application } from '../application-provision/appication-vo';
import { LoaderService } from '../shared/service/form-service/loader-service';
import { Router } from '@angular/router';
import { UserVO } from '../shared/vo/user-vo';
import { UserService } from '../shared/service/user-service';
import { DomSanitizer } from '@angular/platform-browser';
import { DynamicSideNavBarComponent } from '../dynamic-side-nav-bar/dynamic-side-nav-bar.component';
import { interval } from 'rxjs/internal/observable/interval';
import { DynamicStylingService } from '../shared/service/dynamic-styling.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { StompClientService } from 'src/app/message-module/stomp-client.service';



@Component({
  selector: 'app-dynamic-header',
  templateUrl: './dynamic-header.component.html',
  styleUrls: ['./dynamic-header.component.css']
})
export class DynamicHeaderComponent implements OnInit {
  sub = false;
  mobileQuery: MediaQueryList;
  resolutionQuery: MediaQueryList;
  url: any;
  dynamicSideNavWidth = "20.7%";
  width = "79%";
  resolutionChange = false;
  private _mobileQueryListener: () => void;

  constructor(private menuService: MenuService, public loaderService: LoaderService, private cd: ChangeDetectorRef,
    private router: Router, private service: UserService, private stomClientService: StompClientService,
    private sanitizer: DomSanitizer, public dynamicService: DynamicStylingService, changeDetectorRef: ChangeDetectorRef, media: MediaMatcher) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    this.resolutionQuery = media.matchMedia("(max-width: 1080px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    interval(100).subscribe((val) => {
      this.sub = this.mobileQuery.matches;
      // this.setWidth();
    });
    this.resolutionQuery.addListener(this._mobileQueryListener);
    // if (this.resolutionQuery.matches === true) {
    //   this.dynamicSideNavWidth = "17%";
    //   this.width = "83%";
    //   this.resolutionChange = true;
    // } else {
    //   this.resolutionChange = true;
    // }
  }

  menu: MenuVO;
  @Input() application: Application;
  showTopMenuLogo = false;
  showBottomMenuLogo = false;
  showRightMenuLogo = false;
  showLeftMenuLogo = false;
  show: any;
  userVo = new UserVO();
  base64Image: string;
  isLoad = false;
  mode: any;
  dynamicSideNavObject: DynamicSideNavBarComponent;
  sidenavOpen = false;

  @Output() headerEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() isNotificationOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() isMessageOpened: EventEmitter<any> = new EventEmitter<any>();
  @Output() pinEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() messageObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() notificationObject: EventEmitter<any> = new EventEmitter<any>();
  @Output() menuEmitter: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    if (this.application.topMenuId === null
      && this.application.rightMenuId !== null) {
      this.showRightMenuLogo = true;
    }

    if (this.application.topMenuId === null && this.application.rightMenuId === null
      && this.application.bottomMenuId !== null) {
      this.showBottomMenuLogo = true;
    }

    if (this.application.topMenuId === null && this.application.rightMenuId === null
      && this.application.leftMenuId !== null) {
      this.showLeftMenuLogo = true;
    }

    // this.menuService.getMenuByAppId(this.id).subscribe(
    //   data => {
    //     this.menu = data;
    //   }
    // );
    this.show = this.loaderService.showLoader;
    this.service.getLoggedInUserDetails().subscribe(data => {
      if (data) {
        this.service.userVO = data;
        this.userVo = data;
        this.base64Image = this.userVo.profilePicture;
        this.isLoad = true;
        this.service.getUserProfilePicture().subscribe(profile => {
          this.userVo.profilePicture = profile.profilePicture;
          this.base64Image = this.userVo.profilePicture;
        });
      }
    });
  }

  getMessageObject($event) {
    this.messageObject.emit($event);
  }

  getNotificationObject($event) {
    this.notificationObject.emit($event);
  }

  getNotification($event) {
    this.menuEmitter.emit($event);
  }

  getMenuEvent($event) {
    this.headerEmitter.emit($event);
  }

  pinClicked(event) {
    this.pinEmitter.emit(event);
  }

  pinClickedIcon() {
    this.pinEmitter.emit(true);
  }

  showAndHideMenuLogo() {

  }

  getNotificationOpened($event) {
    this.isNotificationOpened.emit($event);
  }

  getMessageOpened($event) {
    this.isMessageOpened.emit($event);
  }

  marketPlaceClicked() {
    this.router.navigate(['/market-place']);
  }

  logout() {
    this.service.logout();
    try {
      if (this.stomClientService.stompClient) {
        this.stomClientService.stompClient.disconnect();
      }
    } catch (e) {
    }
    this.router.navigate(['/login']);
  }

  userProfile() {
    this.router.navigate(['/user-profile']);
  }

  userProfileValue(str) {
    if (str) {
      const assignee = str.split(' ');
      for (let i = 0; i < assignee.length; i++) {
        assignee[i] = assignee[i].charAt(0).toUpperCase();
      }
      return assignee.join('');
    }
  }

  transformImage(profilePicture) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(profilePicture);
  }

  ngAfterViewChecked() {
    let show = this.loaderService.showLoader;
    if (show !== this.show) {
      this.show = show;
      this.cd.detectChanges();
    }
  }
}
