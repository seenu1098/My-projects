import { Component, OnInit } from '@angular/core';
import { TestGroupService } from 'src/shared/service/test-group.service';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { TestGroupVOList } from './test-group-vo';


@Component({
  selector: 'app-list-test-groups',
  templateUrl: './list-test-groups.component.html',
  styleUrls: ['./list-test-groups.component.css']
})
export class ListTestGroupsComponent implements OnInit {

  constructor(private service: TestGroupService, private fb: FormBuilder) { }

  clmsTestcaseGroupsVOList = [new TestGroupVOList()];
  form: FormGroup;
  testGroup: any;

  ngOnInit() {
    this.service.getClaimTestGroup().subscribe(data => {
      this.clmsTestcaseGroupsVOList = data;
    });


  }



  onChange(event) {
    const interests = <FormArray>this.form.get('interests') as FormArray;

    if (event.checked) {
      interests.push(new FormControl(event.source.value))
    } else {
      const i = interests.controls.findIndex(x => x.value === event.source.value);
      interests.removeAt(i);
    }
  }

  getvalue(event) {
  }

}
