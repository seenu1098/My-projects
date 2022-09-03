import { stringify } from "@angular/compiler/src/util";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SnackbarComponent } from "src/app/shared-module/snackbar/snackbar.component";
import { ActionsVO, AutomationVO } from "./event-automation.model";
@Injectable({
    providedIn: 'root'
})
export class Action {

    constructor(private snackbar: MatSnackBar) { }

    appNameList: any[] = [{ name: 'Slack', value: 'slack' },
    { name: 'Microsoft Teams', value: 'microsoft teams' },
    { name: 'Twitter', value: 'twitter' },
    { name: 'LinkedIn', value: 'linkedin' },
    { name: 'Outlook', value: 'microsoft outlook' },
    ];

    keyWords: string[] = ['choose status', 'someone', 'choose subtask status',
        'choose label', 'choose', 'date', 'time period', 'something',
        'choose taskboard', 'choose channel', 'column/custom email', 'enter...', 'enter', 'start', 'end', 'venue'];

    getColor(automationType: string, value: string, taskData: any): string {
        if (automationType === 'label') {
            let label = taskData.labelsList.find(label => label.labelName === value);
            if (label && label.labelcolor) {
                return label.labelcolor;
            }
        } else if (automationType === 'status') {
            let status = taskData.statusList.find(status => status.name === value);
            if (status && status.color) {
                return status.color;
            }
        } else if (automationType === 'subtask status') {
            let array: any[] = [{ name: 'Todo', color: '#87cefa' },
            { name: 'Progress', color: 'rgb(255, 209, 93)' },
            { name: 'Done', color: '#20b2aa' }];
            let subtaskStatus = array.find(status => status.name === value);
            if (subtaskStatus && subtaskStatus.color) {
                return subtaskStatus.color;
            }
        } else {
            return '';
        }
    }

    isAutomation(automationVO: AutomationVO[]): boolean {
        var value: boolean = true;
        if (automationVO.length > 0) {
            for (let i = 0; i < automationVO.length; i++) {
                if (!automationVO[i].conditions
                    || (automationVO[i].conditions && automationVO[i].conditions.length === 0)) {
                    this.snackbar.openFromComponent(SnackbarComponent, {
                        data: 'Please choose a condition',
                    });
                    if (value === true) {
                        value = false;
                    }
                }
                automationVO[i].conditions.forEach(condition => {
                    if (!condition.actions || (condition.actions && condition.actions.length === 0)) {
                        this.snackbar.openFromComponent(SnackbarComponent, {
                            data: 'Please choose a action',
                        });
                        if (value === true) {
                            value = false;
                        }
                    }
                })
            }
        } else {
            this.snackbar.openFromComponent(SnackbarComponent, {
                data: 'Please choose a condition',
            });
            value = false;
        }
        return value;
    }

    checkValidation(automationVO: AutomationVO[], boardName): boolean {
        var value: boolean = true;
        if (automationVO.length > 0) {
            for (let i = 0; i < automationVO.length; i++) {
                if (automationVO[i].root.automationType === 'Date'
                    && (automationVO[i].root.values === undefined
                        || automationVO[i].root.values === null
                        || this.keyWords.includes(automationVO[i].root.values))) {
                    this.snackbar.openFromComponent(SnackbarComponent, {
                        data: 'Please choose a date',
                    });
                    if (value === true) {
                        value = false;
                        return false;
                    }
                }
                automationVO[i].conditions.forEach(condition => {
                    if (condition.automationType === 'task field') {
                        if (condition.eventSpecificMaps) {
                            if (condition.eventSpecificMaps.selectedField.status === undefined ||
                                condition.eventSpecificMaps.selectedField.status === null ||
                                condition.eventSpecificMaps.selectedField.status === '') {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a status',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            } else if (condition.eventSpecificMaps.selectedField.fieldName === undefined ||
                                condition.eventSpecificMaps.selectedField.fieldName === null ||
                                condition.eventSpecificMaps.selectedField.fieldName === '') {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a field',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            } else if (condition.eventSpecificMaps.selectedField.fieldValue === undefined ||
                                condition.eventSpecificMaps.selectedField.fieldValue === null ||
                                condition.eventSpecificMaps.selectedField.fieldValue === '') {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please enter a field value',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                        }
                    } else {
                        if (condition.automationType !== 'create item'
                            && condition.automationType !== 'due date'
                            && condition.automationType !== 'comment'
                            && condition.values && (condition.values[0] === undefined || condition.values[0] === null
                                || this.keyWords.includes(condition.values[0]))) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please choose a ' + this.getConditionValue(condition.automationType),
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                        if (condition.data && (condition.data === undefined || condition.data === null)
                            || this.keyWords.includes(condition.data)) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please choose a ' + this.getConditionValue(condition.automationType),
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                    }
                    condition.actions.forEach(action => {
                        if (action.actionType !== 'app_notification' && action.actionType !== 'app_schedule' && action.actionType !== 'data_table' && (action.values[0] === undefined
                            || action.values[0] === null
                            || (action.actionType !== 'create task' && this.keyWords.includes(action.values[0])
                                && this.keyWords.includes(boardName)))) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please choose a ' + this.getConditionValue(action.actionType),
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                        if (action.actionType === 'data_table') {
                            if (!action.actionSpecificMaps && !action.actionSpecificMaps.dataTableName) {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a data table name',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                            if (!action.mappingValues || action.mappingValues.length === 0) {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a mapping fields',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                            if (!action.actionSpecificMaps && action.actionSpecificMaps.filterValues.length === 0) {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a where clause',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                        }
                        if (action.actionType === 'app_notification' || action.actionType === 'app_schedule') {
                            const actionType = this.checkAppNotificationsValidations(action);
                            if (actionType) {
                                var data: string;
                                if (actionType === 'message') {
                                    data = 'Please enter a message';
                                } else if (actionType === 'header') {
                                    data = 'Please enter a header';
                                } else if (actionType === 'location') {
                                    data = 'Please enter a location';
                                } else {
                                    data = 'Please choose a ' + this.getConditionValue(actionType);
                                }
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: data,
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                        }
                        if (action.actionType === 'due_date_count' && action.values[0]) {
                            if (action.values[0].numberOfDays === undefined || action.values[0].numberOfDays === null
                                || action.values[0].numberOfDays === '' || this.keyWords.includes(action.values[0].numberOfDays)) {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please enter a number of days',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                        }
                        if (action.actionType === 'email_campaign' && action.values[0]) {
                            if (action.values[0].emailServerName === undefined || action.values[0].emailServerName === null
                                || action.values[0].emailServerName === '' || action.values[0].emailServerName === 'choose') {
                                this.snackbar.openFromComponent(SnackbarComponent, {
                                    data: 'Please choose a email server name',
                                });
                                if (value === true) {
                                    value = false;
                                    return false;
                                }
                            }
                        }
                        if ((action.actionType === 'notify' || action.actionType === 'email_campaign') && action.message && action.message !== undefined
                            && action.message !== null && action.message !== ''
                            && this.keyWords.includes(action.message)) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please enter a message',
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                        if (action.actionType === 'email_campaign' && action.values[0] && action.values[0].columnName && (action.values[0].columnName === undefined || action.values[0].columnName === null
                            || action.values[0].columnName === '' || action.values[0].columnName === 'column/custom email')) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please choose a column name',
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                        if (action.actionType === 'email_campaign'
                            && (action.subject === undefined || action.subject === null
                                || action.subject === '' || action.subject === 'enter...')) {
                            this.snackbar.openFromComponent(SnackbarComponent, {
                                data: 'Please enter a subject',
                            });
                            if (value === true) {
                                value = false;
                                return false;
                            }
                        }
                    });
                });
            }
            return value;
        }
    }

    checkAppNotificationsValidations(action: ActionsVO): string {
        var value: string;
        if ((action.applicationName === 'Slack' || action.applicationName === 'Microsoft Teams') && action.values.length === 0) {
            value = 'channel';
        } else if (action.applicationName === 'Outlook') {
            if (action.values[0] === undefined || action.values[0] === null || action.values[0] === '') {
                value = 'toMail';
            } else if ((!action.values[0].actionSpecificMaps || action.values[0].actionSpecificMaps.toRecepientEmailAddress.length === 0)) {
                value = 'toMail';
            } else if (action.actionType !== 'app_schedule' && action.message && action.message !== undefined
                && action.message !== null && action.message !== ''
                && this.keyWords.includes(action.message)) {
                value = 'message';
            } else if (action.actionType === 'app_schedule' && (!action.values[0].actionSpecificMaps || !action.values[0].actionSpecificMaps.startTime || !action.values[0].actionSpecificMaps.startTime.dateTime
                || !action.values[0].actionSpecificMaps.endTime || !action.values[0].actionSpecificMaps.endTime.dateTime)) {
                value = 'dateTime'
            } else if (action.actionType === 'app_schedule' && (!action.values[0].actionSpecificMaps || !action.values[0].actionSpecificMaps.location)) {
                value = 'location';
            } else if (!action.values[0].actionSpecificMaps.header) {
                value = 'header';
            }
        } else if (action.message && action.message !== undefined
            && action.message !== null && action.message !== ''
            && this.keyWords.includes(action.message)) {
            value = 'message';
        }
        return value;
    }

    getConditionValue(automationType: string): string {
        var value: string = '';
        if (automationType === 'notify') {
            value = 'Users or Groups';
        } else if (automationType === 'subtask status') {
            value = 'subtask status';
        } else if (automationType === 'status') {
            value = 'status';
        } else if (automationType === 'task field') {
            value = 'task field';
        } else if (automationType === 'time period') {
            value = 'time period';
        } else if (automationType === 'assigned') {
            value = 'assignee';
        } else if (automationType === 'label') {
            value = 'label';
        } else if (automationType === 'new task') {
            value = 'task';
        } else if (automationType === 'due date') {
            value = 'due date';
        } else if (automationType === 'channel') {
            value = 'channel';
        } else if (automationType === 'email_campaign') {
            value = 'column or enter custom mail';
        } else if (automationType === 'toMail') {
            value = 'to recepient mail';
        } else if (automationType === 'dateTime') {
            value = 'start and end time'
        } else if (automationType === 'location') {
            value = 'location';
        }
        return value;
    }
}