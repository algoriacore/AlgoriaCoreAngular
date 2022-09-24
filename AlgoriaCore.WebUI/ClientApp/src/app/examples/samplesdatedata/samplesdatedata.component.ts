import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    SampleDateDataForListResponse,
    SampleDateDataGetListQuery,
    SampleDateDataServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplesdatedata.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class SamplesDateDataComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: SampleDateDataForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    loading = false;
    saving = false;
    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: SampleDateDataGetListQuery = new SampleDateDataGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-sampledatedata-filters';

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private dateTimeService: DateTimeService,
        private service: SampleDateDataServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;

    }
    ngOnInit() {
        const self = this;

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-sampledatedata');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'id', header: this.l('Id'), width: '100px' },
            { field: 'name', header: this.l('Examples.DateTimes.Name') },
            { field: 'dateTimeData', header: this.l('Examples.DateTimes.DateTime') },
            { field: 'dateData', header: this.l('Examples.DateTimes.Date') },
            { field: 'timeData', header: this.l('Examples.DateTimes.Time') }
        ];

        self.query.pageSize = 10;
        self.query.sorting = 'id';
        self.query.pageNumber = 1;
    }

    filterSearch(event: any): void {
        const self = this;

        event.preventDefault();

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.query.pageNumber = 1;
        self.table.reset();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.service.getSampleDateDataList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);

                // Asigno filtros para que se queden guardados en localStorage
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;
        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';

        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/examples/samplesdatedata/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/examples/samplesdatedata/edit', id]);
    }

    delete(id: number): void {
        const self = this;

        self.alertService.confirm(
            self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteSampleDateData(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            }
        );
    }
}
