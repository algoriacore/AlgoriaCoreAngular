import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LazyLoadEvent } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { UserGetListQuery, UserListResponse, UserServiceProxy } from 'src/shared/service-proxies/service-proxies';

@Component({
    templateUrl: './selectusers.component.html',
    styleUrls: ['../../assets/css-custom/p-datatable-general.scss']
})
export class SelectUsersComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    blockedDocument = false;

    model: any = null;
    tenant?: number = null;

    data: UserListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();
    cols: any[];
    selectedItem: any;
    query: UserGetListQuery = new UserGetListQuery();

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: UserServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.tenant = self.modalConfig.data.tenant;
        self.model = self.modalConfig.data;

        self.form = self.formBuilder.group({
            filterText: ['']
        });

        self.cols = [
            { field: 'id', header: self.l('Id'), width: '100px' },
            { field: 'login', header: self.l('Users.UserNameColGrid') },
            { field: 'name', header: self.l('Users.NameColGrid') },
            { field: 'emailAddress', header: self.l('Users.EmailAddressColGrid') },
            { field: 'isActive', header: self.l('IsActive'), width: '100px' }
        ];

        self.query.tenant = self.tenant;
    }

    filterSearch(event: any): void {
        const self = this;

        self.query.pageNumber = 1;
        self.getList();

        event.preventDefault();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.blockedDocument = true;

        self.service.getUserList(self.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = 'creationTime DESC';
        }

        self.getList();
    }

    select(event: any, rowData: UserListResponse): void {
        const self = this;

        self.return(rowData);

        event.preventDefault();
    }

    return(user: UserListResponse): void {
        const self = this;

        self.modalRef.close(user);
    }
}
