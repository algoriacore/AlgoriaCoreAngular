import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import {
    MailGroupCheckCommand,
    MailGroupForEditResponse,
    MailGroupGetListQuery,
    MailGroupListResponse,
    MailGroupServiceProxy,
    MailGroupUnCheckCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { CopyEmailGroupsComponent } from './copyemailgroups.component';

@Component({
    templateUrl: './emailgroups.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class EmailGroupsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: MailGroupListResponse[];
    fromRecord = 0;
    toRecord = 0;
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: MailGroupGetListQuery = new MailGroupGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-mailgroup-filters';

    permissions: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private mailGroupService: MailGroupServiceProxy,
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

        self.permissions = {
            create: self.permission.isGranted('conftcor.1'),
            edit: self.permission.isGranted('conftcor.2'),
            copy: self.permission.isGranted('conftcor.3'),
            templates: self.permission.isGranted('conftcor.4')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-mailgroup');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'id', header: self.l('Id'), width: '100px' },
            { field: 'displayName', header: self.l('EmailGroups.DisplayNameColGrid') }
        ];
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

        self.mailGroupService.getMailGroupList(self.query)
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

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = '';
        }

        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/admin/emailgroups/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/emailgroups/edit', id]);
    }

    copy(record: MailGroupListResponse): void {
        const self = this;

        const ref = self.dialogService.open(CopyEmailGroupsComponent, {
            width: '75%',
            showHeader: false,
            dismissableMask: false,
            data: new MailGroupForEditResponse({
                id: record.id,
                displayName: record.displayName
            })
        });

        ref.onClose.subscribe((isEdited = false) => {
            if (isEdited) {
                self.getList();
            }
        });
    }

    selectEmailGroup(dto: MailGroupListResponse) {
        const self = this;

        self.alertService.confirm(
            self.l('EmailGroups.SelectMessage', '"' + dto.displayName + '"'), self.l('Confirmation'),
            function (res) {

                if (res) {
                    const cmd = new MailGroupCheckCommand();
                    cmd.id = dto.id;

                    self.app.blocked = true;

                    self.mailGroupService.checkMailGroup(cmd)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                            self.getList();
                        });
                }
            }
        );
    }

    unselectEmailGroup(dto: MailGroupListResponse) {
        const self = this;

        self.alertService.confirm(
            self.l('EmailGroups.UnSelectMessage', '"' + dto.displayName + '"'),
            function (res) {
                if (res === true) {
                    const cmd = new MailGroupUnCheckCommand();
                    cmd.id = dto.id;

                    self.app.blocked = true;

                    self.mailGroupService.unCheckMailGroup(cmd)
                        .pipe(finalize(() => {
                            self.app.blocked = false;
                        }))
                        .subscribe(data => {
                            self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                            self.getList();
                        });
                }
            }
        );
    }

    gotoTemplates(id) {
        this.router.navigate(['/app/admin/emailtemplates/group', id]);
    }

    createMenuItems(rowData: MailGroupListResponse): MenuItem[] {
        const self = this;

        const ll = [
            {
                tooltipOptions: {
                    tooltipLabel: self.l('EmailGroups.Copy'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-fw pi-clone',
                queryParams: rowData,
                command: (event) => {
                    self.copy(event.item.queryParams);
                },
                permissionName: 'conftcor.3'
            }
        ];

        if (rowData.isSelected === true) {
            ll.push({
                tooltipOptions: {
                    tooltipLabel: self.l('EmailGroups.Unselect'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.unselectEmailGroup(event.item.queryParams);
                },
                permissionName: 'conftcor.7'
            });
        } else {
            ll.push({
                tooltipOptions: {
                    tooltipLabel: self.l('EmailGroups.Select'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-fw pi-check',
                queryParams: rowData,
                command: (event) => {
                    self.selectEmailGroup(event.item.queryParams);
                },
                permissionName: 'conftcor.7'
            });
        }

        return self.getGrantedMenuItems(ll);
    }
}
