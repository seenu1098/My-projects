import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { GridService } from '../yorogrid/grid.service';
import { PaginationVO } from './pagination-vo';


export class GridDataSource implements DataSource<any> {

    gridId: any;
    private gridDataSubject = new BehaviorSubject<any[]>([]);

    // tslint:disable-next-line: ban-types
    private behSubjectResultLength = new BehaviorSubject<string>('0');
    resultsLength: any;

    constructor(private gridService: GridService) { }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this.gridDataSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        // tslint:disable-next-line: no-unused-expression
        this.gridDataSubject.complete();
    }

    loadData(pagination: PaginationVO) {
        this.gridService.getGridData(pagination).subscribe((gridData: any) => {
            this.gridDataSubject.next(gridData.data);
            this.behSubjectResultLength.next(gridData.totalRecords);
        });
    }

    loadChecKBoxData(gridData: any) {
        this.gridDataSubject.next(gridData.data);
        this.behSubjectResultLength.next(gridData.totalRecords);
    }

    getCount() {
        return this.behSubjectResultLength;
    }
}
