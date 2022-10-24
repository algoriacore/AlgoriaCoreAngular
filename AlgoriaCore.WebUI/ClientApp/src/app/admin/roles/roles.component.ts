import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import {
    RolDeleteCommand,
    RolForListResponse,
    RolGetListQuery,
    RolServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './roles.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class RolesComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: RolForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: RolGetListQuery = new RolGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-role-filters';

    permissions: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private rolService: RolServiceProxy,
        private changeLogService: ChangeLogService,
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
            create: self.permission.isGranted('Pages.Administration.Roles.Create'),
            edit: self.permission.isGranted('Pages.Administration.Roles.Edit'),
            delete: self.permission.isGranted('Pages.Administration.Roles.Delete')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-role');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'id', header: self.l('Id'),  width: '100px' },
            { field: 'name', header: self.l('Roles.NameColGrid') },
            { field: 'displayName', header: self.l('Roles.DisplayNameColGrid') },
            { field: 'isActiveDesc', header: self.l('IsActive'), width: '100px'  }
        ];

        self.query.pageSize = 10;
        self.query.sorting = 'Id';
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

        self.rolService.getRolList(self.query)
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
        this.router.navigate(['/app/admin/roles/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/roles/edit', id]);
    }

    delete(rowData: RolForListResponse): void {
        const self = this;

        self.alertService.confirmDelete(
            self.l('ConfirmationDeleteRecordWithNameMessage', rowData.displayName), self.l('Confirmation'),
            function () {
                const cmd = new RolDeleteCommand();

                cmd.id = rowData.id;

                self.app.blocked = true;

                self.rolService.deleteRol(cmd)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordSoftDeleted'), self.l('Success'));
                        self.getList();
                    });
            }
        );
    }

    showChangeHistory(id: number): void {
        const self = this;

        self.changeLogService.open('Role', id);
    }
}
