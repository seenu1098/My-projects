export class NotificationVO {
    id: any;
    fromId: any;
    toId: any;
    message: string;
    fromUserName: string;
    taskId: any;
    readTime: any;
    fromUserProfilePicture: string;
    type: string;
    taskboardId: any;
    taskboardTaskId: any;
    link: string;
    createdDate: string;
    isSelected: boolean;
}

export class PaginationVO {
    gridId: string;
    index: any;
    size: number;
    direction: string;
    columnName: string;
    filterValueType: string;
    filterType: string;
}

export class MarkAsReadNotificationVo {
    markAsReadIdList: String[];
}
