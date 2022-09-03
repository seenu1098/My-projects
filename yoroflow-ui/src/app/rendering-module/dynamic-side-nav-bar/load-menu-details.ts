import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { DynamicMenuService } from '../dynamic-menu/dynamic-menu.service';
import { MenuDetailsVO } from '../shared/vo/menu-vo';

export class LoadMenuDetails implements DataSource<any> {
    id: any;
    private gridDataSubject = new BehaviorSubject<any[]>([]);

    // tslint:disable-next-line: ban-types
    private behSubjectResultLength = new BehaviorSubject<any[]>([]);

    constructor(private dynamicMenuService: DynamicMenuService) { }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this.gridDataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // tslint:disable-next-line: no-unused-expression
        this.gridDataSubject.complete();
    }

    loadMenuDetail(id) {
        if (id !== null) {
            this.id = id;
        }
        this.dynamicMenuService.getAllMenusDetails(this.id).subscribe(
            data => {
                this.behSubjectResultLength.next(data);
            }
          );
    }

    getMenuDetails() {
        return this.behSubjectResultLength;
    }
}
