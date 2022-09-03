import { Component, ViewChild, OnInit } from '@angular/core';
import { DynamicFormComponent } from '../shared/components/dynamic-form/dynamic-form.component';
import { Page } from '../shared/vo/page-vo';
import { ActivatedRoute } from '@angular/router';
import { DynamicQueryBuilderService } from '../shared/service/dynamic-query-builder.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';



@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {


  page = new Page();
  id: number;

  testForm: FormGroup;
  field = {
    controlType: 'input',
    field: {
      'name': 'autoComplete',
      'label': {
        'labelName': 'Auto Complete',
        'labelOption': 'always'
      },
      'dataType': 'string',
      'defaultValue': 'sdfsdfsd',
      'rows': 20,
      'cols': 5,
      control: {
        'tableName': ['test', 'test_two'],
        'columnName': 'column',
        'joinClause': 'join',
        'buttonType': 'submit',
        'gridId': 'grid-configuration',
        'optionsValues': [{
          'code': '2121',
          'description': 'sdf'
        },
        {
          'code': '2121',
          'description': 'sdf'
        }],
        filters: [{
          'columnName': 'column',
          'value': 'value',
          'dataType': 'dataType'
        },
        {
          'columnName': 'column',
          'value': 'value',
          'dataType': 'dataType'
        }]
      },
      validations: [{
        'type': 'required'
      },
      {
        'type': 'maxlength',
        'maxLength': 6
      },
      {
        'type': 'minlength',
        'minLength': 7
      },
      {
        'type': 'min',
        'minLength': 6
      },
      {
        'type': 'max',
        'maxLength': 6
      },
      ]
    }
  };

  constructor(private route: ActivatedRoute, private service: DynamicQueryBuilderService, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.testForm = this.fb.group({});
    this.testForm.addControl('autoComplete', new FormControl());
    this.testForm.get('autoComplete').setValidators([Validators.required, Validators.maxLength(6), Validators.minLength(2)]);

    this.route.params.subscribe(params => {
      this.id = params.id;
    });
  }

  submit($event) {
      this.service.savePage($event).subscribe(data => {
      });
    }

}

