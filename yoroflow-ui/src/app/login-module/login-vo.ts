export class LoginVO {
    username: string;
    password: string;
    recaptchaResponse: string;
    otpNumber: any;
    hasTwofactor: boolean;
    userType: string;
}

export class QrDetailsVo {
    qrImageUrl: string;
    codes: string[];
    secret: string;
    otp: string;
    userName: string;
    otpProvider: string;
    isCheck: string;
}

export class GoogleAuthVo {
    tokenId: string;
    email: string;
    isSilentToken: boolean;
    loginType: string;
}
export class TermsConditionsVo {
    userId: any;
    termsAndConditionsAccepted: boolean;
}

export class MicrosoftLoginDetails {
    hasTwofactor: boolean;
    subdomain: string;
    microsoftLoginInProcess: boolean;
}
