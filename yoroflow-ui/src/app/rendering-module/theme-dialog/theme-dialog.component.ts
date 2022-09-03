import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemeService } from 'src/app/services/theme.service';
import { SnackbarComponent } from 'src/app/shared-module/snackbar/snackbar.component';
import { UserService } from '../shared/service/user-service';
import { AdditionalSettings, UserVO } from '../shared/vo/user-vo';

@Component({
  selector: 'app-theme-dialog',
  templateUrl: './theme-dialog.component.html',
  styleUrls: ['./theme-dialog.component.scss']
})
export class ThemeDialogComponent implements OnInit {

  form: FormGroup;
  fontSize: number = 12;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private dialogRef: MatDialogRef<ThemeDialogComponent>,
    private dialog: MatDialog, public themeService: ThemeService, private overlayContainer: OverlayContainer,
    private userService: UserService, private snackbar: MatSnackBar, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      defaultLanguage: ['en']
    });
    this.fontSizeUpdate(this.themeService.fonts.find(f => f.name === this.themeService.fontSizeClass));
  }

  changeTheme(themeName: string): void {
    this.themeService.setThemeForView(themeName);
  }

  changeLayout(layoutName: string): void {
    this.themeService.setLayoutForView(layoutName);
  }

  close(): void {
    this.themeService.setTheme(localStorage.getItem('theme'));
    this.themeService.setLayout(localStorage.getItem('layout'));
    this.themeService.setFontSize(localStorage.getItem('font'));
    this.dialogRef.close();
  }

  save(): void {
    const userVO = new UserVO();
    userVO.userId = this.userService.userVO.userId;
    userVO.theme = this.themeService.themeName;
    userVO.layout = this.themeService.layoutName;
    const additionalSettings = new AdditionalSettings();
    additionalSettings.fontSize = this.themeService.fonts.find(f => f.isSelected === true)['fontSize'];
    userVO.additionalSettings = additionalSettings;
    this.userService.saveTheme(userVO).subscribe(data => {
      if (data.response.includes('updated')) {
        localStorage.removeItem('layout');
        localStorage.setItem('layout', this.themeService.layoutName);
        localStorage.removeItem('theme');
        localStorage.setItem('theme', this.themeService.themeName);
        localStorage.setItem('font', this.themeService.fontSizeClass);
      }
      this.snackbar.openFromComponent(SnackbarComponent, {
        data: data.response,
      });
    });
    this.dialogRef.close();
  }

  fontSizeUpdate(font: any): void {
    this.themeService.fonts.forEach(f => f.isSelected = false);
    font.isSelected = true;
    this.themeService.setFontSize(font.name);
  }

}
