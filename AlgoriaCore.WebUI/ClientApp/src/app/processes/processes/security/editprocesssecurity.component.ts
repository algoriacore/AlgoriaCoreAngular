import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { FormService } from 'src/shared/services/form.service';
import {
    ProcessSecurityMemberCreateCommand,
    SecurityMemberType,
    SecurityMemberLevel,
    ProcessSecurityMemberGetListQuery,
    ProcessSecurityMemberForListResponse,
    ComboboxItemDto,
    UserServiceProxy,
    OrgUnitServiceProxy,
    OrgUnitGetComboQuery,
    ProcessSecurityMemberDeleteCommand,

    ProcessServiceProxy
} from '../../../../shared/service-proxies/service-proxies';
import { LazyLoadEvent } from 'primeng/api';

@Component({
    templateUrl: './editprocesssecurity.component.html',
    styleUrls: ['../../../../assets/css-custom/p-datatable-general.scss']
})
export class EditProcessSecurityComponent extends AppComponentBase implements OnInit {

    @ViewChild('dtUser', { static: false }) userTable;
    @ViewChild('dtOrgUnit', { static: false }) orgUnitTable;

    userForm: FormGroup;
    orgUnitForm: FormGroup;

    blockedDocument = false;

    parent: number;
    template: number;
    fieldLabels: any = {};

    addUserIsShown = false;
    addOrgUnitIsShown = false;

    userFilterText: null;
    userQuery: ProcessSecurityMemberGetListQuery = new ProcessSecurityMemberGetListQuery();
    userList: ProcessSecurityMemberForListResponse[];
    userPagedTableSummary: PagedTableSummary = new PagedTableSummary();
    userCols: any[];
    userSelectedItem: any;

    orgUnitFilterText: null;
    orgUnitQuery: ProcessSecurityMemberGetListQuery = new ProcessSecurityMemberGetListQuery();
    orgUnitList: ProcessSecurityMemberForListResponse[];
    orgUnitPagedTableSummary: PagedTableSummary = new PagedTableSummary();
    orgUnitCols: any[];
    orgUnitSelectedItem: any;

    SecurityMemberType = SecurityMemberType;
    SecurityMemberLevel = SecurityMemberLevel;
    userCombo: ComboboxItemDto[] = [];
    orgUnitCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: ProcessServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private formService: FormService,
        private serviceUser: UserServiceProxy,
        private serviceOrgUnit: OrgUnitServiceProxy
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get userF() {
        return this.userForm.controls;
    }

    get orgUnitF() {
        return this.orgUnitForm.controls;
    }

    ngOnInit() {
        const self = this;

        self.template = self.modalConfig.data.template;
        self.parent = self.modalConfig.data.parent;
        self.userQuery.template = self.template;
        self.userQuery.parent = self.parent;
        self.userQuery.type = SecurityMemberType.User;

        self.orgUnitQuery.template = self.template;
        self.orgUnitQuery.parent = self.parent;
        self.orgUnitQuery.type = SecurityMemberType.OrgUnit;

        self.userCols = [
            { field: 'memberDesc', header: self.l('ProcessSecurity.Type.User') },
            { field: 'levelDesc', header: self.l('ProcessSecurity.Level') },
            { field: 'isExecutorDesc', header: self.l('ProcessSecurity.IsExecutor') }
        ];

        self.orgUnitCols = [
            { field: 'memberDesc', header: self.l('ProcessSecurity.Type.OrgUnit') },
            { field: 'levelDesc', header: self.l('ProcessSecurity.Level') },
            { field: 'isExecutorDesc', header: self.l('ProcessSecurity.IsExecutor') }
        ];

        this.prepareForm();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            user: self.l('ProcessSecurity.Type.User'),
            userLevel: self.l('ProcessSecurity.Level'),
            userIsExecutor: self.l('ProcessSecurity.IsExecutor'),
            orgUnit: self.l('ProcessSecurity.Type.OrgUnit'),
            orgUnitLevel: self.l('ProcessSecurity.Level'),
            orgUnitIsExecutor: self.l('ProcessSecurity.IsExecutor'),
        };

        self.userForm = self.formBuilder.group({
            user: [null, [Validators.required]],
            userLevel: [null, [Validators.required]],
            userIsExecutor: [false]
        });

        self.orgUnitForm = self.formBuilder.group({
            orgUnit: [null, [Validators.required]],
            orgUnitLevel: [null, [Validators.required]],
            orgUnitIsExecutor: [false]
        });
    }

    filterSearchUser(): void {
        const self = this;

        self.userTable.reset();
        self.userQuery.pageNumber = 1;
        self.getListUser();
    }

    filterSearchOrgUnit(): void {
        const self = this;

        self.orgUnitTable.reset();
        self.orgUnitQuery.pageNumber = 1;
        self.getListOrgUnit();
    }

    createUser(): void {
        const self = this;

        // stop here if form is invalid
        if (self.userForm.invalid) {
            this.formService.showErrors(self.userForm, self.fieldLabels);
            return;
        }

        self.blockedDocument = true;

        const createCmd = new ProcessSecurityMemberCreateCommand();

        createCmd.template = self.template;
        createCmd.parent = self.parent;
        createCmd.type = SecurityMemberType.User;
        createCmd.member = self.userF.user.value.value;
        createCmd.level = self.userF.userLevel.value;
        createCmd.isExecutor = self.userF.userLevel.value === SecurityMemberLevel.Editor.toString() ?
            self.userF.userIsExecutor.value : false;

        self.service.createProcessSecurityMember(createCmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('ProcessSecurity.SuccessfulCreate'), self.l('Success'));
                self.getListUser();
                self.activaModoNuevo();
            });
    }

    createOrgUnit(): void {
        const self = this;

        // stop here if form is invalid
        if (self.orgUnitForm.invalid) {
            this.formService.showErrors(self.orgUnitForm, self.fieldLabels);
            return;
        }

        self.blockedDocument = true;

        const createCmd = new ProcessSecurityMemberCreateCommand();

        createCmd.template = self.template;
        createCmd.parent = self.parent;
        createCmd.type = SecurityMemberType.OrgUnit;
        createCmd.member = self.orgUnitF.orgUnit.value.value;
        createCmd.level = self.orgUnitF.orgUnitLevel.value;
        createCmd.isExecutor = self.orgUnitF.orgUnitLevel.value === SecurityMemberLevel.Editor.toString() ?
            self.orgUnitF.orgUnitIsExecutor.value : false;

        self.service.createProcessSecurityMember(createCmd)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('ProcessSecurity.SuccessfulCreate'), self.l('Success'));
                self.getListOrgUnit();
                self.activaModoNuevo();
            });
    }

    delete(event: any, rowData: ProcessSecurityMemberForListResponse): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.blockedDocument = true;

                self.service.deleteProcessSecurityMember(new ProcessSecurityMemberDeleteCommand({
                    template: self.template, id: rowData.id, type: rowData.type, level: rowData.level
                })).pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));

                        if (rowData.type === SecurityMemberType.User) {
                            self.getListUser();
                        } else if (rowData.type === SecurityMemberType.OrgUnit) {
                            self.getListOrgUnit();
                        }
                    });
            });
    }

    getListUser(): void {
        const self = this;

        self.userQuery.template = self.template;
        self.userQuery.filter = self.userFilterText;
        self.blockedDocument = true;

        self.service.getProcessSecurityMemberList(self.userQuery)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.userList = data.items;

                // Calculate paged table summary
                self.userPagedTableSummary = self.getPagedTableSummay(
                    data.totalCount,
                    self.userQuery.pageNumber,
                    self.userQuery.pageSize);
            });
    }

    getListOrgUnit(): void {
        const self = this;

        self.orgUnitQuery.filter = self.orgUnitFilterText;
        self.blockedDocument = true;

        self.service.getProcessSecurityMemberList(self.orgUnitQuery)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.orgUnitList = data.items;

                // Calculate paged table summary
                self.orgUnitPagedTableSummary = self.getPagedTableSummay(
                    data.totalCount,
                    self.orgUnitQuery.pageNumber,
                    self.orgUnitQuery.pageSize);
            });
    }

    loadDataUser(event: LazyLoadEvent) {
        const self = this;

        self.userQuery.sorting = event.sortField ?
            (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC') + ', MemberDesc ASC') : '';
        self.userQuery.pageNumber = 1 + (event.first / event.rows);
        self.userQuery.pageSize = event.rows;

        self.getListUser();
    }

    loadDataOrgUnit(event: LazyLoadEvent) {
        const self = this;

        self.orgUnitQuery.sorting = event.sortField ?
            (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC') + ', MemberDesc ASC') : '';
        self.orgUnitQuery.pageNumber = 1 + (event.first / event.rows);
        self.orgUnitQuery.pageSize = event.rows;

        self.getListOrgUnit();
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();
    }

    fillAutocompleteDynamicUser(event: any): void {
        const self = this;

        self.blockedDocument = true;

        self.serviceUser.getUserAutocompleteList(event.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.userCombo = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
            });
    }

    fillAutocompleteDynamicOrgUnit(event: any): void {
        const self = this;

        self.blockedDocument = true;

        self.serviceOrgUnit.getOrgUnitCombo(new OrgUnitGetComboQuery({ filter: event.query }))
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.orgUnitCombo = data;
            });
    }

    return(): void {
        const self = this;

        self.modalRef.close();
    }

    clickAddUserIsShow(e: any): void {
        const self = this;

        self.addUserIsShown = !self.addUserIsShown;

        e.preventDefault();
    }

    clickAddOrgUnitIsShow(e: any): void {
        const self = this;

        self.addOrgUnitIsShown = !self.addOrgUnitIsShown;

        e.preventDefault();
    }
}
