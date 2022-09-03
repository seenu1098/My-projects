import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatDialog, MatSnackBar, MatAccordion } from '@angular/material';
import { ClaimDetailsDialogBoxComponent } from '../claim-details-dialog-box/claim-details-dialog-box.component';
import { LivetestService } from '../../shared/service/livetest.service';
import { TestGroupItemFlatNode, TestGroupItemNode, TestCaseExecutionVO } from '../../shared/vo/testgroupnode-vo';
import { EnvironmentListVO } from '../../shared/vo/environment-vo';
import { TestGroupService } from '../../shared/service/test-group.service';
import { ChecklistDatabase } from '../../shared/service/checklist-database.service';
import { SnackBarComponent } from '../snack-bar/snack-bar.component';
import { ReplacementOptionExecuteComponent } from '../replacement-option-execute/replacement-option-execute.component';
import { ActivatedRoute } from '@angular/router';


/**
 * @title Tree with checkboxes
 */
@Component({
  selector: 'app-testcase-groups-list',
  templateUrl: 'testcase-groups-list.component.html',
  styleUrls: ['testcase-groups-list.component.css'],
})
export class TestcaseGroupListComponent implements OnInit {

  checked = false;
  constructor(private _database: ChecklistDatabase, private service: LivetestService, private fb: FormBuilder
    , private testGroupService: TestGroupService, private dialog: MatDialog, private snackBar: MatSnackBar,
    private router: ActivatedRoute) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TestGroupItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this._database.dataChange.subscribe(data => {
      this.dataSource.data = data;
      this.treeControl.expandAll();
    });

  }

  checkListForm: FormGroup;
  response: EnvironmentListVO[];
  selectedNode: TestGroupItemNode[] = [];
  testExecutionVO = new TestCaseExecutionVO();
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TestGroupItemFlatNode, TestGroupItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TestGroupItemNode, TestGroupItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TestGroupItemFlatNode | null = null;

  treeControl: FlatTreeControl<TestGroupItemFlatNode>;

  treeFlattener: MatTreeFlattener<TestGroupItemNode, TestGroupItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TestGroupItemNode, TestGroupItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TestGroupItemFlatNode>(true /* multiple */);

  ngOnInit(): void {

    this.treeControl.expandAll();
    this.checkListForm = this.fb.group({
      environmentName: ['', Validators.required],
      batchName: ['', Validators.required]
    });

    this.router.paramMap.subscribe(params => {
      if (params.get('name')) {
        this.checkListForm.get('batchName').setValue(params.get('name'));
      }
    });
    this.getEnvironmentNames();
  }

  getLevel = (node: TestGroupItemFlatNode) => node.level;

  isExpandable = (node: TestGroupItemFlatNode) => node.expandable;

  getChildren = (node: TestGroupItemNode): TestGroupItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TestGroupItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TestGroupItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TestGroupItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new TestGroupItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.value = node.value;
    flatNode.desc = node.desc;
    flatNode.claim = node.claim;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TestGroupItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TestGroupItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TestGroupItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TestGroupItemFlatNode): void {

    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TestGroupItemFlatNode): void {
    let parent: TestGroupItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TestGroupItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TestGroupItemFlatNode): TestGroupItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  getEnvironmentNames() {
    this.service.getEnvironmentNamesList().subscribe(data => {
      this.response = data;
    });
  }

  openDialogBox(value) {
    this.dialog.open(ClaimDetailsDialogBoxComponent, {
      width: '1500px',
      height: '600px',
      data: value
    });
  }

  replaceOption(userForm: NgForm) {
    if (userForm.valid) {
      const selectedNodes = this.checklistSelection.selected.filter(s => s.level !== 0);
      this.testExecutionVO = this.checkListForm.value;
      this.testExecutionVO.testGroupItemVOList = selectedNodes;
      this.service.checkBacthName(this.testExecutionVO.batchName).subscribe(data => {
        if (data === 0) {
          const dialogRef = this.dialog.open(ReplacementOptionExecuteComponent, {
            width: '1500px',
            height: '600px',
            disableClose: true,
            data: this.testExecutionVO,
          });
          // tslint:disable-next-line: no-unused-expression
          dialogRef.afterClosed().subscribe(result => {
            if (result !== '') {
              userForm.resetForm();
              this.resetNodes();
            }
          });
        } else {
          this.snackBar.openFromComponent(SnackBarComponent, {
            data: 'Batch name Already Exists',
          });
        }

      });
    }

  }

  clearSearch(userForm: NgForm) {
    userForm.reset();
    this.resetNodes();
  }

  resetNodes() {
    const selectedNodes = this.checklistSelection.selected.filter(s => s.level !== 0);
    for (let i = 0; i < selectedNodes.length; i++) {
      this.checklistSelection.deselect(selectedNodes[i]);
    }
  }
}
