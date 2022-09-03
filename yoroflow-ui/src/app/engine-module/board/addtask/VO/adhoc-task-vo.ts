export class AdhocTask {
    taskID: any;
    status: string;
    assignee: string;
    dueDate: Date;
    taskName: any;
    files: FormData;
    description: string;
    notesId: any;
    notes: any;
    taskFiles: TaskFilesVO[];
    taskNotes: TaskNotesVO[];
}

export class TaskFilesVO {
    file: string;
    fileName: string;
    fileId: any;
}

export class TaskNotesVO {
    notes: string;
}
