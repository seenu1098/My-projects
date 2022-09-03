import {
    Component,
    OnInit,
    HostBinding,
    OnChanges,
    SimpleChanges,
    OnDestroy,
    NgZone,
    Inject,
    ElementRef,
    AfterViewInit
} from '@angular/core';
import { GanttDatePoint } from '../../class/date-point';
import { Subject, merge } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { headerHeight, todayHeight, todayWidth, todayBorderRadius } from '../../gantt.styles';
import { isNumber } from '../../utils/helpers';
import { GanttDate } from '../../utils/date';
import { GANTT_UPPER_TOKEN, GanttUpper } from '../../gantt-upper';
import { GanttViewType } from './../../class/view-type';
const mainHeight = 5000;
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'gantt-calendar-overlay',
    templateUrl: './calendar.component.html'
})
export class GanttCalendarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
    selectedLang: any;
    get view() {
        this.selectedLang = localStorage.getItem('translate_lang');
        if (this.selectedLang === undefined || this.selectedLang === null || this.selectedLang === 'null' || this.selectedLang === '') {
            this.selectedLang = 'en';
          }
        this.ganttUpper.view.primaryDatePoints.forEach(async data => {
            if (data && data.text) {
                if (data.text.includes('月')) {
                    let value = data.text.slice(0, 4);
                    const monthName = this.setMonthName(data.text);
                    data.text = monthName + ' ' + value;
                } else if (data.text.includes('年')) {
                    var re = new RegExp('年');
                    var value = data.text.replace(re, ' ');
                    data.text = value;
                }
            }
        });
        this.ganttUpper.view.secondaryDatePoints.forEach(async data => {
            if (data && data.text) {
                if (data.text.includes('月')) {
                    data.text = this.setMonthName(data.text);
                } else if (data.text.includes('第')) {
                    data.text = this.setWeek(data.text);
                } else if (data.text.includes('年')) {
                    var re = new RegExp('年');
                    var value = data.text.replace(re, ' ');
                    data.text = value;
                }
            }
        });
        return this.ganttUpper.view;
    }

    private unsubscribe$ = new Subject();

    headerHeight = headerHeight;

    mainHeight = mainHeight;

    todayHeight = todayHeight;

    todayWidth = todayWidth;

    todayBorderRadius = todayBorderRadius;

    viewTypes = GanttViewType;

    @HostBinding('class.gantt-calendar-overlay') className = true;

    constructor(
        @Inject(GANTT_UPPER_TOKEN) public ganttUpper: GanttUpper,
        private ngZone: NgZone,
        private elementRef: ElementRef<HTMLElement>,
        public translate: TranslateService
    ) { }

    setTodayPoint() {
        const x = this.view.getTodayXPoint();
        const today = new GanttDate().getDate();
        const todayEle = this.elementRef.nativeElement.getElementsByClassName('gantt-calendar-today-overlay')[0] as HTMLElement;
        const rect = this.elementRef.nativeElement.getElementsByClassName('today-rect')[0] as HTMLElement;
        const line = this.elementRef.nativeElement.getElementsByClassName('today-line')[0] as HTMLElement;

        if (isNumber(x)) {
            if (rect) {
                rect.style.left = `${x - todayWidth / 2}px`;
                rect.style.top = `${headerHeight - todayHeight}px`;
                rect.innerHTML = today.toString();
            }
            if (line) {
                line.style.left = `${x}px`;
                line.style.top = `${headerHeight}px`;
                line.style.bottom = `${-mainHeight}px`;
            }
        } else {
            todayEle.style.display = 'none';
        }
    }
    ngOnInit() {
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            merge(this.ganttUpper.viewChange, this.ganttUpper.view.start$)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(() => {
                    this.setTodayPoint();
                });
        });
    }

    ngAfterViewInit() { }

    ngOnChanges(changes: SimpleChanges): void { }

    trackBy(point: GanttDatePoint, index: number) {
        return point.text || index;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }


    setMonthName(value: string): string {
        let returnValue: string = null;
        if (value.includes('12')) {
            return this.translate.translations[this.selectedLang]['December'];
        } else if (value.includes('11')) {
            return this.translate.translations[this.selectedLang]['November'];
        } else if (value.includes('10')) {
            return this.translate.translations[this.selectedLang]['October'];
        } else if (value.includes('09')) {
            return this.translate.translations[this.selectedLang]['September'];
        } else if (value.includes('08')) {
            return this.translate.translations[this.selectedLang]['August'];
        } else if (value.includes('07')) {
            return this.translate.translations[this.selectedLang]['July'];
        } else if (value.includes('06')) {
            return this.translate.translations[this.selectedLang]['June'];
        } else if (value.includes('05')) {
            return this.translate.translations[this.selectedLang]['May'];
        } else if (value.includes('04')) {
            return this.translate.translations[this.selectedLang]['April'];
        } else if (value.includes('03')) {
            return this.translate.translations[this.selectedLang]['March'];
        } else if (value.includes('02')) {
            return this.translate.translations[this.selectedLang]['February'];
        } else if (value.includes('01')) {
            return this.translate.translations[this.selectedLang]['January'];
        }
    }

    setWeek(value: string): string {
        var re1 = new RegExp('周');
        var re2 = new RegExp('第');
        var replacedValue = value.replace(re2, '');
        var finalValue = replacedValue.replace(re1, '');
        return this.translate.translations[this.selectedLang]['Week'] + ' ' + finalValue;
    }
}
