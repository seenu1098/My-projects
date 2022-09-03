import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SprintSettings } from './sprint-model';
import { SprintService } from './sprint.service';

@Component({
  selector: 'app-sprint-dialog',
  templateUrl: './sprint-dialog.component.html',
  styleUrls: ['./sprint-dialog.component.scss']
})
export class SprintDialogComponent implements OnInit {

  public dayList: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  public form: FormGroup;
  public sprintSettings = new SprintSettings();

  constructor(@Inject(MAT_DIALOG_DATA) public data, private dialogRef: MatDialogRef<SprintDialogComponent>, private fb: FormBuilder, private sprintService: SprintService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      sprintDuration: [2, [Validators.required, Validators.min(1)]],
      sprintStartDay: ['monday'],
      sprintEstimations: ['sp-fib'],
      sprintDurationType: ['w'],
      sprintSettingsId: ['']
    });
    if (this.data.sprintSettings) {
      this.form.patchValue(this.data.sprintSettings);
    }
  }

  save(): void {
    if (this.form.valid) {
      let sprintSettings = new SprintSettings();
      sprintSettings = this.form.getRawValue();
      if (this.data.taskboardId) {
        sprintSettings.taskboardId = this.data.taskboardId;
        this.sprintService.saveSprintSettings(sprintSettings).subscribe(data => {
          if (data && data.response.includes('Sprint Saved Successfully') || data.response.includes('Sprint Updated Successfully')) {
            this.dialogRef.close(true);
            if (data.response.includes('Sprint Saved Successfully')) {
              sprintSettings.sprintSettingsId = data?.id;
            }
            this.data.taskboardVO.sprintSettingsVo = sprintSettings;
            this.data.taskboardVO.sprintEnabled = true;
          }
        });
      } else {
        this.dialogRef.close({ sprintSettings: sprintSettings });
      }
    }
  }

}
