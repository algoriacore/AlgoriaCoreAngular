import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { MenuItem } from 'primeng/api/menuitem';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    AuditLogListResponse,
    UserGetListQuery,
    UserListResponse,
    UserServiceProxy
} from 'src/shared/service-proxies/service-proxies';

@Component({
    templateUrl: './samplechat.findusers.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class SampleChatFindUsersComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    blockedDocument = false;

    model: AuditLogListResponse = null;

    data: UserListResponse[];
    totalRecords = 0;

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: UserGetListQuery = new UserGetListQuery();

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private userService: UserServiceProxy
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.prepareForm();

        self.model = self.modalConfig.data;

        self.cols = [
            { field: 'login', header: self.l('Users.UserNameColGrid') },
            { field: 'fullName', header: self.l('Users.NameColGrid') },
            { field: 'emailAddress', header: self.l('Users.EmailAddressColGrid') }
        ];

        self.query.pageSize = 10;
        self.query.sorting = 'Id';
        self.query.pageNumber = 1;
    }

    prepareForm() {
        const self = this;

        self.form = self.formBuilder.group({
            filterText: ['']
        });
    }

    getExecutionTime(): string {
        const self = this;

        return moment(self.model.executionTime).fromNow() + ' (' + moment(self.model.executionTime).format('YYYY-MM-DD HH:mm:ss') + ')';
    }

    filterSearch(): void {
        const self = this;

        self.query.pageNumber = 1;
        self.table.reset();
    }

    getUsers(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.blockedDocument = true;

        self.userService.getUserList(self.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.data = data.items;
                self.totalRecords = data.totalCount;
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.getUsers();
    }

    selectUser(event: any, rowData: UserListResponse): void {
        const self = this;

        self.return(rowData);
    }

    return(user: UserListResponse = null): void {
        const self = this;

        self.modalRef.close(user);
    }
}
