import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    OrgUnitCreateCommand,
    OrgUnitForEditResponse,
    OrgUnitGetForEditQuery,
    OrgUnitServiceProxy,
    OrgUnitUpdateCommand,
    OrgUnitUserCreateCommand, OrgUnitUserForListResponse,
    OrgUnitUserGetListQuery, UserServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './editorgunits.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class EditOrgUnitsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dtUsers', { static: false }) tableUsers;

    form: FormGroup;

    parentOU?: number;
    id?: number = null;
    model: OrgUnitForEditResponse = null;
    fieldLabels: any = {};

    filterTextUser: null;
    usersCombo: ComboboxItemDto[] = [];
    acUserSelected: any;

    users: OrgUnitUserForListResponse[];
    pagedTableSummaryUser: PagedTableSummary = new PagedTableSummary();
    selectedItemUser: any;
    queryUsers: OrgUnitUserGetListQuery = new OrgUnitUserGetListQuery();

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: OrgUnitServiceProxy,
        private formService: FormService,
        private changeLogService: ChangeLogService,
        private serviceUser: UserServiceProxy,
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

        if (self.activatedRoute.snapshot.url.length === 3) {
            if (self.activatedRoute.snapshot.url[2].path === 'create') {
                self.parentOU = self.activatedRoute.snapshot.params['ou'] ? Number(self.activatedRoute.snapshot.params['ou']) : null;
            } else if (self.activatedRoute.snapshot.url[1].path === 'edit') {
                self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
            }
        }

        this.prepareForm();

        self.queryUsers.orgUnit = self.id;

        if (self.id) {
            self.getForEdit(self.id);
        }
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

        self.app.blocked = true;

        self.serviceUser.getUserAutocompleteList(event.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.usersCombo = data.map(p => new ComboboxItemDto({ value: p.id.toString(), label: p.fullName }));
            });
    }

    addUser(): void {
        const self = this;

        if (self.acUserSelected) {
            self.app.blocked = true;

            self.service.createOrgUnitUser(new OrgUnitUserCreateCommand({ orgUnit: self.id, user: self.acUserSelected.value }))
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.acUserSelected = null;

                    self.notify.success(self.l('OrgUnits.OrgUnit.Users.User.SuccessfulCreate'), self.l('Success'));
                    self.getUserList();
                });
        }
    }

    filterSearchUser(event: any): void {
        const self = this;

        self.tableUsers.reset();
        self.queryUsers.pageNumber = 1;

        self.getUserList();

        event.preventDefault();
    }

    getUserList(): void {
        const self = this;

        self.queryUsers.filter = self.filterTextUser;
        self.app.blocked = true;

        self.service.getOrgUnitUserList(self.queryUsers)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.users = data.items;

                // Calculate paged table summary
                self.pagedTableSummaryUser = self.getPagedTableSummay(
                    data.totalCount,
                    self.queryUsers.pageNumber,
                    self.queryUsers.pageSize);
            });
    }

    loadDataUser(event: LazyLoadEvent) {
        const self = this;

        if (event.sortField) {
            self.queryUsers.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.queryUsers.sorting = '';
        }

        self.queryUsers.pageNumber = 1 + (event.first / event.rows);
        self.queryUsers.pageSize = event.rows;
        self.getUserList();
    }

    deleteUser(id: number): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteOrgUnitUser(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getUserList();
                    });
            });
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getOrgUnitForEdit(new OrgUnitGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(data.name);
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        self.app.blocked = true;

        if (self.id) {
            const updateCmd = new OrgUnitUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;

            self.service.updateOrgUnit(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('OrgUnits.OrgUnit.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new OrgUnitCreateCommand();

            createCmd.parentOU = self.parentOU;
            createCmd.name = self.f.name.value;

            self.service.createOrgUnit(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('OrgUnits.OrgUnit.SuccessfulCreate'), self.l('Success'));

                    if (self.permission.isGranted('Pages.Administration.OrgUnits.Edit')) {
                        self.router.navigate(['/app/admin/orgunits/edit', data]);
                    } else {
                        self.return();
                    }
                });
        }
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();

        // focus
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('OrgUnit', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/orgunits']);
    }
}
