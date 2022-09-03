import { OverlayContainer } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserService } from '../rendering-module/shared/service/user-service';
import { UserVO } from '../rendering-module/shared/vo/user-vo';

export interface Themes {
  displayName: string;
  themeName: string;
  primaryColor: string;
  accentColor: string;
  warnColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public themeEmittter = new EventEmitter();
  public layoutEmitter = new EventEmitter();
  themes: Themes[] = [
    {
      displayName: 'Default Theme',
      themeName: 'default-theme',
      primaryColor: '#464775',
      accentColor: '#e91e63',
      warnColor: '#ff867c',
    },
    {
      displayName: 'Theme 2',
      themeName: 'theme2',
      primaryColor: '#4169e1',
      accentColor: '#e44b4b',
      warnColor: '#ff867c',
    },
    {
      displayName: 'Theme 3',
      themeName: 'theme3',
      primaryColor: '#00b2ff',
      accentColor: '#fe5b00',
      warnColor: '#ff867c',
    },
    {
      displayName: 'Theme 4',
      themeName: 'theme4',
      primaryColor: '#20d489',
      accentColor: '#fe5b00',
      warnColor: '#ff867c',
    }
  ];

  layouts: any[] = [
    { name: 'simple' },
    { name: 'modern' }
  ]

  fonts: any[] = [
    { name: 'font-model-1', fontSize: 12, isSelected: true },
    { name: 'font-model-2', fontSize: 13, isSelected: false },
    { name: 'font-model-3', fontSize: 14, isSelected: false },
    { name: 'font-model-4', fontSize: 15, isSelected: false }
  ];

  allLanguages = [
    {
      name: 'English',
      lang: 'en',
      href: '/en'
    },
    {
      name: 'Français',
      lang: 'fr',
      href: '/fr'
    },
    {
      name: 'Español',
      lang: 'es',
      href: '/es'
    }
  ];

  selectedTheme: any;
  themeName: string;
  primaryColor: string;
  accentColor: string;
  warnColor: string;
  selectedLayout: any;
  layoutName: string;
  themeSubscription: Subscription;
  fontSizeClass: string;
  dialogClassName = 'dialog-css';


  constructor(private http: HttpClient, private userService: UserService, private overlayContainer: OverlayContainer) { }

  setTheme(themeName: string): void {
    this.selectedTheme = this.themes.find(theme => theme.themeName === themeName);
    this.overlayContainer.getContainerElement().classList.remove(localStorage.getItem('theme'));
    this.themeName = this.selectedTheme.themeName;
    this.primaryColor = this.selectedTheme.primaryColor;
    this.accentColor = this.selectedTheme.accentColor;
    this.warnColor = this.selectedTheme.warnColor;
    this.overlayContainer.getContainerElement().classList.add(themeName);
    localStorage.removeItem('theme');
    localStorage.setItem('theme', themeName);
    this.themeEmittter.emit(themeName);
  }

  setLayout(layoutName: string): any {
    this.selectedLayout = this.layouts.find(layout => layout.name === layoutName);
    this.layoutName = this.selectedLayout.name;
    localStorage.removeItem('layout');
    localStorage.setItem('layout', layoutName);
    this.layoutEmitter.emit(layoutName);
  }

  setThemeForView(themeName: string): void {
    this.selectedTheme = this.themes.find(theme => theme.themeName === themeName);
    this.overlayContainer.getContainerElement().classList.remove(this.themeName);
    this.themeName = this.selectedTheme.themeName;
    this.primaryColor = this.selectedTheme.primaryColor;
    this.accentColor = this.selectedTheme.accentColor;
    this.warnColor = this.selectedTheme.warnColor;
    this.overlayContainer.getContainerElement().classList.add(themeName);
    this.themeEmittter.emit(themeName);
  }

  setLayoutForView(layoutName: string): void {
    this.selectedLayout = this.layouts.find(layout => layout.name === layoutName);
    this.layoutName = this.selectedLayout.name;
    this.layoutEmitter.emit(layoutName);
  }

  setFontSize(fontSize: string): void {
    this.overlayContainer.getContainerElement().classList.remove(this.fontSizeClass);
    this.fontSizeClass = fontSize;
    this.overlayContainer.getContainerElement().classList.add(fontSize);
  }

  setMatMiniFabButtonCssForDialog(): void {
    this.overlayContainer.getContainerElement().classList.add(this.dialogClassName);
  }
}
