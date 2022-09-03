export class MessageGroup {
    id: string;
    groupName: string;
    groupUnreadMessageCount: number;
    messageGroupUsersVOList: MessageGroupUser[] = [];
}

export class MessageGroupUser {
    id: string;
    userId: string;
}
