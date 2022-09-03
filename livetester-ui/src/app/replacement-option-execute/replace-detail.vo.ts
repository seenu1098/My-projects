import { BeneficiaryVO, PayorVO, ProviderVO } from 'src/shared/vo/claim-vo';

export class ReplaceDetailsVO  {
    voidClaimsFirst: string;
    increaseBydays: number;
    claimsId: number[];
    environmentName: string;
    batchName: string;
    claimSubmitters: string;
    claimReceiver: string;
    replacementBeneficiary: ReplaceBenficiary[];
    replacementProvider: ReplaceProvider[];
    replacementPayor: ReplacePayor[];
    replacementPa: ReplacePA[];
}

export class ReplaceBenficiary {
    beneficaryIdentifier: string;
    beneficaryControl: string ;
    alwaysReplace: string;
}

export class ReplaceProvider {
    provider: string;
    providerControl: string ;
    alwaysReplace: string;
}
export class ReplacePayor {
    payor: string;
    payorControl: string ;
    alwaysReplace: string;
}
export class ReplacePA {
    pa: string;
    paControl: string ;
    alwaysReplace: string;
}

export class UniqueBeneficiaryVO {
    beneficiaryVO = new  BeneficiaryVO();
    alwaysReplace: string;
}
export class UniquePayorVO {
    payorVO = new PayorVO();
    alwaysReplace: string;
}
export class UniquePAVO {
    pa: string;
    alwaysReplace: string;
}
export class UniqueProviderVO {
    providerVO = new ProviderVO();
    alwaysReplace: string;
}

