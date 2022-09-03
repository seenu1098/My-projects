import { LicenseVO } from "src/app/shared-module/vo/license-vo";

export interface ResponseString {
        userId: any;
        response: string;
        count: number;
        responseId: string;
        object: any;
        uuid: string;
        licenseVO: LicenseVO;
        id: string;
}
