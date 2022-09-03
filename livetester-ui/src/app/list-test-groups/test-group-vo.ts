import { ClaimVO } from 'src/shared/vo/claim-vo';

export class TestGroupVOList {
    id: number;
    testcaseGroupName = '';
    description: string;
    claimVO: ClaimVO[] = [new ClaimVO()];
}
