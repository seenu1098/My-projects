export class WorkspaceDashboardVO {
    id: string;
    dashboardName: string;
    userId: string;
    dashbaordId: string;
    dashboardWidgets: DashboardWidgetVO[] = [];
}

export class DashboardWidgetVO {
    id: string;
    widgetName: string;
    widgetType: string;
    dashboardId: string;
    rownum: number;
    colnum: number;
    filteredColumns: string[] = [];
}