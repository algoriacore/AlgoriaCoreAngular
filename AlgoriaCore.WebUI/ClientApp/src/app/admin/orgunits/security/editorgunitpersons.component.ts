import { AppComponentBase, PagedTableSummary } from '../../../app-component-base';
import { OnInit, Component, ViewChild, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
    ComboboxItemDto,
    UserServiceProxy,
    OrgUnitServiceProxy,
    OrgUnitUserCreateCommand,
    OrgUnitUserGetListQuery,
    OrgUnitUserForListResponse
} from '../../../../shared/service-proxies/service-proxies';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs/operators';
import { LazyLoadEvent } from 'primeng/api';

@Component({
    templateUrl: './editorgunitpersons.component.html',
    styleUrls: ['../../../../assets/css-custom/p-datatable-general.scss']
})
export class EditOrgUnitPersonsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt', { static: false }) table;

    form: FormGroup;

    blockedDocument = false;

    fieldLabels: any = {};
    orgUnit: number = null;
    usersCombo: ComboboxItemDto[] = [];
    acUserSelected: any;

    query: OrgUnitUserGetListQuery = new OrgUnitUserGetListQuery();
    data: OrgUnitUserForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();
    selectedItem: any;
    filterText: null;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private service: OrgUnitServiceProxy,
        private modalRef: DynamicDialogRef,
        private modalConfig: DynamicDialogConfig,
        private serviceUser: UserServiceProxy
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.orgUnit = self.modalConfig.data.orgUnit;
        self.query.orgUnit = self.orgUnit;

        this.prepareForm();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            name: self.l('OrgUnits.OrgUnit.Name')
        };

        self.form = self.formBuilder.group({
            name: [null, [Validators.required, Validators.maxLength(100)]]
        });
    }

    fillUsersAutocompleteDynamic(event: any): void {
        const self = this;

        self.blockedDocument = true;

        self.serviceUser.getUserAutocompleteList(event.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.usersCombo = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
            });
    }

    add(): void {
        const self = this;

        if (self.acUserSelected) {
            self.blockedDocument = true;

            self.service.createOrgUnitUser(new OrgUnitUserCreateCommand({ orgUnit: self.orgUnit, user: self.acUserSelected.value }))
                .pipe(finalize(() => {
                    self.blockedDocument = false;
                }))
                .subscribe(data => {
                    self.acUserSelected = null;

                    self.notify.success(self.l('OrgUnits.OrgUnit.Users.User.SuccessfulCreate'), self.l('Success'));
                    self.getList();
                });
        }
    }

    filterSearch(): void {
        const self = this;

        self.query.pageNumber = 1;
        self.table.reset();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.filterText;
        self.blockedDocument = true;

        self.service.getOrgUnitUserList(self.query)
            .pipe(finalize(() => {
                self.blockedDocument = false;
            }))
            .subscribe(data => {
                self.data = data.items;

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(
                    data.totalCount,
                    self.query.pageNumber,
                    self.query.pageSize);
            });
    }

    loadData(event: LazyLoadEvent) {
        const self = this;

        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';
        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;
        self.getList();
    }

    delete(id: number): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.blockedDocument = true;

                self.service.deleteOrgUnitUser(id)
                    .pipe(finalize(() => {
                        self.blockedDocument = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            });
    }

    return(): void {
        const self = this;

        self.modalRef.close(self.pagedTableSummary.totalRecords);
    }
}
