import { BeneficiaryVO, ProviderVO, PayorVO } from 'src/shared/vo/claim-vo';

export class EnvironmentPresetVO {
    id: number ;
    environmentId: number;
    type: string;
    beneficiary:  BeneficiaryVO;
    provider: ProviderVO;
    payor:  PayorVO ;
    paVO: PAVO;
}

export class PAVO {
    number: string;
    description: string;
}
