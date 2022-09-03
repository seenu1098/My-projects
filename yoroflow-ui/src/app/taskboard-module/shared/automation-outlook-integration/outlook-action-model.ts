export class ActionMap {
    toRecepientEmails: string[] = [];
    ccRecepientEmails: ToRecepientEmailAddress[] = [];
    toRecepientEmailAddress: ToRecepientEmailAddress[] = [];
    startTime = new TimeZoneModel();
    endTime = new TimeZoneModel();
    header: string;
    location: string;
    enableVirtualMeeting: boolean;
    meetingApp: string;
}

export class ToRecepientEmailAddress {
    address: string;
    name: string;
    offset: number;
    variableType: string;
}

export class TimeZoneModel {
    dateTime: string;
    timeZone: string;
    offset: number;
    variableType: string;
}

export class ChipModel {
    name: string;
    type: string;
}