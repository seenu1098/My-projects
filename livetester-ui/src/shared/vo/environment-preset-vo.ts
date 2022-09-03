import { BeneficiaryVO, ProviderVO, PayorVO } from './claim-vo';

export class PaVO {
    number = '';
    description = '';
}


export class EnvironmentPresetVO {
    id: number;
    environmentId: number;
    type: string;
    key: string;
    beneficiary: BeneficiaryVO = new BeneficiaryVO();
    provider: ProviderVO = new ProviderVO();
    payor: PayorVO = new PayorVO();
    paVO: PaVO = new PaVO();
}
