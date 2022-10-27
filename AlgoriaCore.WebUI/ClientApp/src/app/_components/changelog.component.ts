import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { ChangeLogForListResponse, ChangeLogGetListQuery, ChangeLogServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { StringsHelper } from '../../shared/helpers/StringsHelper';

@Component({
    templateUrl: 'changelog.component.html',
    styleUrls: ['../../assets/css-custom/p-datatable-general.scss']
})
export class ChangeLogComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    data: ChangeLogForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();
    cols: any[];
    selectedItem: any;
    query: ChangeLogGetListQuery = new ChangeLogGetListQuery();

    loading = false;

    blockedDocument = false;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private service: ChangeLogServiceProxy
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.cols = [
            { field: 'datetime', header: this.l('ChangeLogs.ChangeLog.Datetime'), sortable: true, width: '180px' },
            { field: 'userDesc', header: this.l('ChangeLogs.ChangeLog.User'), sortable: true },
            { field: 'detail', header: this.l('ChangeLogs.ChangeLog.Detail'), sortable: false }
        ];

        self.query.table = self.modalConfig.data.table;
        self.query.key = self.modalConfig.data.key;
    }

    filterSearch(): void {
        const self = this;

        self.query.pageNumber = 1;
        self.query.filter = self.f.filterText.value;
        self.getList();
    }

    getList(): void {
        const self = this;

        self.blockedDocument = true;

        self.service.getChangeLogList(self.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                data.items.forEach(function (item) {
                    item.detail = self.replaceLabel(item.detail);
                });

                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;
        self.getList();
    }

    processDetail(detail: string): string {
        return detail ? StringsHelper.replaceAll(detail, '\n', '<br/>') : '';
    }

    return(): void {
        const self = this;

        self.modalRef.close();
    }
}
