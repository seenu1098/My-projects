export class TaskNotes {
    taskNotesAttId: string;
    notes: string;
    addedBy: string;
    userName: string;
    creationTime: any;
    processInstanceTaskId: string;
    openComment: boolean = false;
    isEdit: boolean = false;
    taskNotes: TaskNotes[] = [];
    isReply: boolean = false;
    parentNotesId: string;
    taskNotesLength: number = 0;
    mentionedUsersEmail: string[] = [];
    mentionedUsersId: string[] = [];
    modifiedOn: any;
}
