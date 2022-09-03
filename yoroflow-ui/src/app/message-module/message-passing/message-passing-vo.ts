export class Message {
    id: any;
    message: string;
    fromId: string;
    toId: string;
    readTime: any;
    createdOn: any;
    groupId: string;
    fromUserName?: string;
    toUserName?: string;
    profilePicture?: string;
}

export class MessageHistory {
    userId: any;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    color: string;
    messageVOList: Message[] = [];
    isSelected: boolean;
    count: number;
}
