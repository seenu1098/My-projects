import { NodePosition } from '@swimlane/ngx-graph';

export interface Edge {
    id?: string;
    source: string;
    target: string;
    label?: string;
    model?: Model;
    data?: any;
    points?: any;
    line?: string;
    textTransform?: string;
    textAngle?: number;
    oldLine?: any;
    oldTextPath?: string;
    textPath?: string;
    midPoint?: NodePosition;
}

export interface Model {
    label: string;
}