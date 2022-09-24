import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { AppComponent } from 'src/app/app.component';
import {
    MailServiceMailGetListQuery,
    MailServiceMailListResponse,
    MailServiceMailServiceProxy,
    TenantGetListCompleterQuery,
    TenantListResponse,
    TenantServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { DateTimeService } from 'src/shared/services/datetime.service';

@Component({
    templateUrl: './mailservicemail.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})

export class MailServiceMailComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: MailServiceMailListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: MailServiceMailGetListQuery = new MailServiceMailGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-mailservicemail-filters';
    permissions: any;

    isHost = false;
    filteredTenants: TenantListResponse[] = [];
    advancedFiltersAreShown = false;

    constructor(
        injector: Injector,
        public app: AppComponent,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: MailServiceMailServiceProxy,
        private dateTimeService: DateTimeService,
        private tenantService: TenantServiceProxy
    ) {
        super(injector);
    }

    get f() {
        return this.form.controls;
    }

    ngOnInit() {

        const self = this;

        self.permissions = {
            consult: self.permission.isGranted('Pages.Administration.MailServiceMail')
        };

        self.isHost = self.app.currentUser.tenantId == null;

        // eslint-disable-next-line max-len
        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-mailservicemail'); self.helpOnScreenService.show('MAILSERVICEMAIL.MAILSERVICEMAIL.VIEW');

        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter],
            rangeDates: [],
            tenantId: [null],
            onlyHost: [self.isHost === true],
            filteredTenant: [{ value: null, disabled: true }]
        });

        self.cols = [
            { field: 'status', header: this.l('MailServiceMailStatuss.MailServiceMailStatus'), width: '70px;' },
            { field: 'mailServiceRequestDate', header: this.l('MailServiceMails.MailServiceMail.MailServiceRequest') },
            { field: 'isLocalConfigDesc', header: this.l('MailServiceMails.MailServiceMail.IsLocalConfig') },
            { field: 'sendto', header: this.l('MailServiceMails.MailServiceMail.Sendto') },
            { field: 'copyTo', header: this.l('MailServiceMails.MailServiceMail.CopyTo') },
            { field: 'subject', header: this.l('MailServiceMails.MailServiceMail.Subject') }
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

        const startDate = self.f.rangeDates.value !== null &&
            self.f.rangeDates.value[0] !== null ? self.f.rangeDates.value[0] : self.dateTimeService.getCurrentDateTimeToDate();
        const endDate = self.f.rangeDates.value !== null && self.f.rangeDates.value[1] !== null ? self.f.rangeDates.value[1] : startDate;

        self.query.filter = self.f.filterText.value;
        self.query.startDate = self.dateTimeService.getDateTimeToSaveServer(startDate).startOf('day');
        self.query.endDate = self.dateTimeService.getDateTimeToSaveServer(endDate).endOf('day');
        self.query.onlyHost = self.f.onlyHost.value;
        self.query.tenantId = self.f.filteredTenant.value !== null ? self.f.filteredTenant.value.id : null;

        self.app.blocked = true;

        self.service.getMailServiceMailPagedList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';
        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    consult(id: number): void {
        this.router.navigate(['/app/mailgrpcservice/mailservicemail/edit', id]);
    }

    filterTenant(event): void {
        const self = this;
        const query = event.query;

        const cmd = new TenantGetListCompleterQuery();
        cmd.filter = query;
        self.tenantService.getTenantsListCompleter(cmd)
            .subscribe(data => {
                self.filteredTenants = data;
            });
    }

    onClickOnlyHost(): void {
        const self = this;

        if (self.f.onlyHost.value) {
            self.f.filteredTenant.disable();
            self.f.filteredTenant.setValue(null);
        } else {
            self.f.filteredTenant.enable();
        }
    }
}

