export class YoroDocumentVO {
    documentId: any;
    parentDocumentId: any;
    documentName: string;
    documentKey: string;
    documentData: FormData;
    mentionedUsersEmail: any[];
    mentionedUsersId: any[];
}
export class securityAssignVO {
    documentId: any;
    securityVOList: SecurityVO[];
    deletedTeamsIdList: any[];
    deletedOwnerIdList: any[];
    yoroDocsOwner: any[];
    readAllowed: boolean;
    updateAllowed: boolean;
}
export class TeamNamesVO {
    groupId: any;
    readAllowed: boolean;
    updateAllowed: boolean;
}
export class SecurityVO {
    groupId: any;
    readAllowed: boolean;
    updateAllowed: boolean;
}
export class YoroGroups {
    id: number;
    tenantId: string;
    name: string;
    description: string;
    yoroGroupsUserVO: YoroGroupsUserVO[] = [];
}
export class YoroGroupsUserVO {
    id: number;
    userId: any[];
    groupId: number;
}

export class teamVO {
    documentId: any;
    type: string;
    securityVOList: SecurityVO[];
    deletedTeamsIdList: any[];
}
export class commentsVO{
id:number;
parentCommentId:number;
docId:number;
comment:string;
commentSection:string;
createdBy:string;
modifiedOn:any;
createdOn:any;
index:number;
length:number;
DocsCommentVo:nestedDocsCommentVo[]=[];
}
export class nestedDocsCommentVo{

}




