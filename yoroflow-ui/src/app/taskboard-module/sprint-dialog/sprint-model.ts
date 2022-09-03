export class SprintSettings {
    public sprintSettingsId: string;
    public taskboardId: string;
    public sprintEstimations: string;
    public sprintStartDay: string;
    public sprintDuration: number;
    public sprintDurationType: string;
}

export class SprintVO {
    public sprintId: string;
    public sprintSettingsId: string;
    public sprintStatus: string;
    public sprintName: string;
    public sprintEstimations: string;
    public sprintStartDay: string;
    public sprintTotalOriginalPoints: number;
    public sprintSeqNumber: number;
    public sprintStartDate: any;
    public sprintEndDate: any;
    public sprintTotalEstimatedHours: number;
    public sprintTotalWorkedHours: number;
    public sprintCounts:number;
}

export class SprintTasksVo {
    public sprintId: string;
    public sprintTaskId: string;
    public sprintEstimatedPoints: number;
    public sprintEstimatedHours: number;
    public sprintTotalHoursSpent: number;
    public taskboardTaskId: String[] = [];
}