import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { TestGroupItemNode } from '../vo/testgroupnode-vo';
import { TestGroupService } from './test-group.service';
import { TestGroupVOList } from 'src/app/list-test-groups/test-group-vo';

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable({ providedIn: 'root' })
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TestGroupItemNode[]>([]);

  get data(): TestGroupItemNode[] { return this.dataChange.value; }

  constructor(private service: TestGroupService) {
    this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    this.service.getClaimTestGroup().subscribe(data => {
      this.dataChange.next(this.getTestCaseGroupVO(data));
    });

  }


  getTestCaseGroupVO(arrTestGroupVO: TestGroupVOList[]): TestGroupItemNode[] {
    // loop -- parent
    // TestGroupVO ==> parent
    // ClaimVO ==> Child
    const testGroupItem: TestGroupItemNode[] = [];

    for (let i = 0; i < arrTestGroupVO.length; i++) {
      const testGrpVO = arrTestGroupVO[i];

      const parentNode = new TestGroupItemNode();
      parentNode.item = testGrpVO.description;
      parentNode.value = testGrpVO.id;

      const childNodes: TestGroupItemNode[] = [];

      if (testGrpVO.claimVO.length !== 0) {
        for (let j = 0; j < testGrpVO.claimVO.length; j++) {

          const claimVO = testGrpVO.claimVO[j];
          const testCaseNode = new TestGroupItemNode();
          testCaseNode.item = claimVO.claimTestcaseName;
          testCaseNode.value = claimVO.claimId;
          testCaseNode.desc = claimVO.claimType;
          testCaseNode.claim = claimVO;
          childNodes.push(testCaseNode);
        }
        parentNode.children = childNodes;
      }
      testGroupItem.push(parentNode);
    }
    return testGroupItem;
  }
}
