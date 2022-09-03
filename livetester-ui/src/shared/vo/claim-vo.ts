
export class AddressVO {
    address = '';
    city = '';
    state = '';
    zipcode = '';
}

export class BeneficiaryVO {
    identifier = '';
    firstName = '';
    lastName = '';
    dob: Date;
    gender: string;
    description = '';
    address = new AddressVO();

}

export class ProviderVO {
    npi = '';
    taxonomy = '';
    firstName = '';
    lastName = '';
    organizationName = '';
    taxId = '';
    type = '';
    serviceFacility = '';
    description = '';
    address = new AddressVO();
}

export class PayorVO {
    identifier = '';
    name = '';
    description = '';
    address = new AddressVO();
}

// export class ClaimHeaderExpectedVO {
//     // paidAmount: number;
//     // paidUnits: number;
//     // allowedAmount: number;
//     // allowedUnits: number;
//     // claimType: number;
//     //  errorCodesList: string[] = null;
//     elements: any;
// }

export class ClaimValueCodeVO {
    valueCode: string;
    valueCodeAmount: number;
}

export class ClaimSurgicalCodeVO {
    surgicalCode: string;
    surgicalDate: Date;
}
export class ClaimOccuranceCodeVO {
    occuranceCode: string;
    occuranceCodeDate: Date;
}
export class ClaimOccuranceSpanCodeVO {
    occuranceSpanCode: string;
    occuranceSpanCodeDate: string;
}

export class ToothStatusVO {
    toothNumber: number;
    toothStatus: string;
}
export class DentalVO {
    toothStatusList: ToothStatusVO[] = [new ToothStatusVO()];
}



export class ServiceFacilityVO {
    facilityName: string;
    npi: string;
    address = new AddressVO();
}

export class ClaimHeaderVO {
    patientControlNo = '';
    facilityType = '';
    serviceFacility = new ProviderVO();
    billedAmount: number;
    billedUnits: number;
    fromDate: Date;
    toDate: Date;
    frequency: string;
    parentTCN: string;
    source: string;
    primaryDiagnosis = '';
    secondaryDiagnosisList: string[];
    admitDiagnosis: string;
    priorAuth1: string;
    priorAuth2: string;
    drgCode: string;
    admitDate: string;
    dischargeDate: string;
    patientStatus: string;
    dischargeStatus: string;
    admitTime: string;
    dischargeTime: string;
    valueCodeList: ClaimValueCodeVO[] = [new ClaimValueCodeVO()];
    surgicalCodeList: ClaimSurgicalCodeVO[] = [new ClaimSurgicalCodeVO()];
    occuranceCodeList: ClaimOccuranceCodeVO[] = [new ClaimOccuranceCodeVO()];
    occuranceSpanCodeList: ClaimOccuranceSpanCodeVO[] = [new ClaimOccuranceSpanCodeVO()];
    conditionCodeList: string[];
    treatmentCodeList: string[];
    dental = new DentalVO();
    expectedElements: any;
    expectedResult: any;
}

export class ClaimLineExpectedResultsVO {
    paidUnits: number;
    paidAmount: number;
    allowedUnits: number;
    allowedAmount: number;
    errorCodesList: string[];
}

export class ServiceLineDentalVO {
    toothCodeList: string[];
    oralCavityDesignationCodeList: string[];
}

export class ServiceVO {
    claimServiceId: number;
    fromDate: Date;
    toDate: Date;
    procedureCode = '';
    procedureCodeType = '';
    billedUnitsMeasure = '';
    revenueCode: string;
    billedAmount: number;
    facilityType = '';
    billedUnits: number;
    serviceFacility = new ProviderVO();
    modifiersList: string[];
    diagnosisCode1: string;
    diagnosisCode2: string;
    diagnosisCode3: string;
    diagnosisCode4: string;
    priorAuth1: string;
    priorAuth2: string;
    servicing: ProviderVO = new ProviderVO();
    dental = new ServiceLineDentalVO();
    expectedElements: any;
    expectedResults: ClaimLineExpectedResultsVO = new ClaimLineExpectedResultsVO();
}

export class ClaimVO {
    claimId: number;
    templateId: 0;

    templateName: string;
    testScenario: string;
    claimTestcaseName: string;

    claimSubmitters: string;
    claimReceiver: string;
    formType: string;
    claimType: string;

    beneficiary: BeneficiaryVO = new BeneficiaryVO();
    subscriber: BeneficiaryVO = new BeneficiaryVO();
    payor: PayorVO = new PayorVO();
    billing: ProviderVO = new ProviderVO();
    servicing: ProviderVO = new ProviderVO();

    claimHeader: ClaimHeaderVO = new ClaimHeaderVO();

    services: ServiceVO[] = [new ServiceVO()];
}

export class TemplateVO {
    id: number;
    templateName: string;
}

export class TestGroupVO {
    id: number;
    testcaseGroupName: string;
    description: string;
}

export class ClaimTypeVO {
    id: number;
    claimTypeCode: string;
    description: string;
    formType: string;

}
export class ClaimEntityVO {
    id: number;
    templateId: number;
    testCaseName: string;
    jsonData: ClaimVO;
    testcaseGroups: TestGroupVO[];

}

export class TestGroupCaseVO {
    templateId: number;
    claimName: string;
    claimTestcaseGroupName: string;

}

export class DuplicateClaimVO {
    claimId: number;
    testCaseName: string;
    testcaseGroups: TestGroupVO[];
}

export class DuplicateTemplateVO {
    templateId: number;
    templateName: string;
}

