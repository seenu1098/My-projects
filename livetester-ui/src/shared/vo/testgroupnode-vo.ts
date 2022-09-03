import { ClaimVO } from './claim-vo';

export class TestGroupItemNode {
  children: TestGroupItemNode[];
  item: string;
  desc: string;
  value: number;
  claim: ClaimVO;
}

export class TestCaseExecutionVO {
  testGroupItemVOList: TestGroupItemFlatNode[] = [new TestGroupItemFlatNode()];
  environmentName: string;
  batchName: string;
}
export class TestGroupItemFlatNode {
  desc: string;
  item: string;
  level: number;
  value: number;
  expandable: boolean;
  claim: ClaimVO;
}

export class BatchTestCaseVO {
  id: number;
  batchId: number;
  testId: number;


}
