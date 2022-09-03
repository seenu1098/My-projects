import { TableObjectsVO } from "../../../creation-module/table-objects/table-object-vo";
import { Page, Permission } from "./page-vo";
import { Workflow } from "./workflow.model";

export class JsonData {
    workflowVO: Workflow;
    page: Page[] = [];
    permission: Permission[] = [];
    tableObjectListVO: TableObjectsVO[] = [];
    subdomainName: string;
}