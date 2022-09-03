import {
    Component,
    OnInit,
    Input,
    TemplateRef,
    HostBinding,
    ElementRef,
    OnChanges,
    OnDestroy,
    Inject,
    ViewChild,
    Output,
    EventEmitter,
    AfterViewInit
} from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { GanttBarDrag } from './bar-drag';
import { hexToRgb } from '../../utils/helpers';
import { GanttDragContainer } from '../../gantt-drag-container';
import { barBackground } from '../../gantt.styles';
import { GanttBarClickEvent } from '../../class';
import { GANTT_UPPER_TOKEN, GanttUpper } from '../../gantt-upper';
import { GanttItemUpper } from '../../gantt-item-upper';
import { MatMenuTrigger } from '@angular/material/menu';

function linearGradient(sideOrCorner: string, color: string, stop: string) {
    return `linear-gradient(${sideOrCorner},${color} 0%,${stop} 40%)`;
}

@Component({
    selector: 'ngx-gantt-bar,gantt-bar',
    templateUrl: './bar.component.html',
    providers: [GanttBarDrag]
})
export class NgxGanttBarComponent extends GanttItemUpper implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    @Output() barClick = new EventEmitter<GanttBarClickEvent>();

    @ViewChild('content') contentElementRef: ElementRef<HTMLDivElement>;

    @HostBinding('class.gantt-bar') ganttItemClass = true;

    @ViewChild(MatMenuTrigger, { static: true }) tootlTipMenu: MatMenuTrigger;

    color = 'red';
    isShow: boolean = false;
    contextMenuPosition = { x: '0px', y: '0px' };
    bufferValue: number;

    myOptions = {
        'maxWidth':324,
        'theme':'light',
    }

    constructor(
        private dragContainer: GanttDragContainer,
        private drag: GanttBarDrag,
        elementRef: ElementRef<HTMLDivElement>,
        @Inject(GANTT_UPPER_TOKEN) public ganttUpper: GanttUpper
    ) {
        super(elementRef, ganttUpper);
    }

    ngOnInit() {
        super.onInit();
        this.dragContainer.dragEnded.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.setContentBackground();
        });
        this.bufferValue = 100 - this.item.origin.percentage;
    }

    ngAfterViewInit() {
        this.drag.createDrags(this.elementRef, this.item, this.ganttUpper);
        this.setContentBackground();
    }

    ngOnChanges(): void {
        super.onChanges();
    }

    onBarClick(event: Event) {
        // this.menu.openMenu();
        this.barClick.emit({ event, item: this.item.origin });
        // this.menu.closeMenu();
    }

    private setContentBackground() {
        const contentElement = this.contentElementRef.nativeElement;
        const color = this.item.color || barBackground;
        const style: Partial<CSSStyleDeclaration> = this.item.barStyle || {};
        if (this.item.origin.start && this.item.origin.end) {
            style.background = color;
            style.borderRadius = '';
        }
        if (this.item.origin.start && !this.item.origin.end) {
            style.background = linearGradient('to left', hexToRgb(color, 0.55), hexToRgb(color, 1));
            style.borderRadius = '4px 12.5px 12.5px 4px';
        }
        if (!this.item.origin.start && this.item.origin.end) {
            style.background = linearGradient('to right', hexToRgb(color, 0.55), hexToRgb(color, 1));
            style.borderRadius = '12.5px 4px 4px 12.5px';
        }
        if (this.item.progress >= 0) {
            const contentProgressElement = contentElement.querySelector('.gantt-bar-content-progress') as HTMLDivElement;
            style.background = hexToRgb(color, 0.3);
            style.borderRadius = '';
            contentProgressElement.style.background = color;
        }

        for (const key in style) {
            if (style.hasOwnProperty(key)) {
                contentElement.style[key] = style[key];
            }
        }
    }

    stopPropagation(event: Event) {
        event.stopPropagation();
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    mouseEnter(event: Event): void {
        this.isShow = true;
        // this.tootlTipMenu.openMenu();
    }

    mouseLeave(): void {
        this.isShow = false;
        // this.tootlTipMenu.openMenu();
    }

    onContextMenu(event: MouseEvent) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        // this.tootlTipMenu.menuData = { item: node };
        this.tootlTipMenu.menu.focusFirstItem('mouse');
        this.tootlTipMenu.openMenu();
    }
}
