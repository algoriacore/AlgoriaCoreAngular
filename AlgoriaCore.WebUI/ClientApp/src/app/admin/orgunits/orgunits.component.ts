import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, TreeNode } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { OrgUnitForListResponse, OrgUnitGetListQuery, OrgUnitServiceProxy } from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { EditOrgUnitPersonsComponent } from './security/editorgunitpersons.component';

@Component({
    templateUrl: './orgunits.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class OrgUnitsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: OrgUnitForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: OrgUnitGetListQuery = new OrgUnitGetListQuery();
    nodes: TreeNode[];

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-orgunit-filters';

    permissions = { create: false, edit: false, delete: false };

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: OrgUnitServiceProxy,
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

        self.permissions.create = self.permission.isGranted('Pages.Administration.OrgUnits.Create');
        self.permissions.edit = self.permission.isGranted('Pages.Administration.OrgUnits.Edit');
        self.permissions.delete = self.permission.isGranted('Pages.Administration.OrgUnits.Delete');

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-orgunit');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'name', header: this.l('OrgUnits.OrgUnit.Name') },
            { field: 'size', header: this.l('OrgUnits.OrgUnit.Size') }
        ];

        self.query.level = 1;
        self.query.pageSize = 10;
        self.query.sorting = 'name';
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

        self.service.getOrgUnitList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;
                self.nodes = [];

                for (const item of data.items) {
                    self.nodes.push({
                        data: item,
                        leaf: !item.hasChildren,
                        expanded: false
                    });
                }

                // Calculate paged table summary
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);

                // Asigno filtros para que se queden guardados en localStorage
                self.browserStorageService.set(self.browserStorageTableFilterKey, self.query);
            });
    }

    loadNodes(event: any) {
        const self = this;

        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';
        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    onNodeExpand(event) {
        const self = this;
        const node = event.node;

        self.app.blocked = true;

        self.service.getOrgUnitByParentOUList(node.data.id)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                node.children = [];

                for (const item of data) {
                    node.children.push({
                        data: item,
                        leaf: !item.hasChildren,
                        expanded: false
                    });
                }

                self.nodes = [...self.nodes];
            });
    }

    expandChildren(node: TreeNode, expand = true) {
        const self = this;

        if (node.children) {
            node.expanded = expand;

            for (const cn of node.children) {
                this.expandChildren(cn);
            }
        }
    }

    expandAllChildren(expand = true) {
        const self = this;

        for (const node of self.nodes) {
            self.expandChildren(node, expand);
        }
    }

    expandAll() {
        const self = this;

        self.expandAllChildren();
        self.nodes = self.nodes.map(p => p);
    }

    collapseAll() {
        const self = this;

        self.expandAllChildren(false);
        self.nodes = self.nodes.map(p => p);
    }

    create(ou?: number): void {
        if (ou) {
            this.router.navigate(['/app/admin/orgunits', ou, 'create']);
        } else {
            this.router.navigate(['/app/admin/orgunits/create']);
        }
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/orgunits/edit', id]);
    }

    delete(id: number): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteOrgUnit(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            });
    }

    configPersons(rowNode: TreeNode): void {
        const self = this;

        const ref = self.dialogService.open(EditOrgUnitPersonsComponent, {
            width: '80%',
            header: self.l('OrgUnits.OrgUnit.Users'),
            showHeader: true,
            closeOnEscape: false,
            closable: false,
            dismissableMask: false,
            data: {
                orgUnit: rowNode.data.id
            }
        });

        ref.onClose.subscribe((total: number) => {
            rowNode.data.size = total;
            self.nodes = self.nodes.map(p => p);
        });
    }

    createMenuItems(rowNode: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                tooltipOptions: {
                    tooltipLabel: self.l('Add'),
                    tooltipPosition: 'top'
                },
                icon: 'fa fa-fw fa-plus',
                queryParams: rowNode.data,
                command: (event) => {
                    self.create(event.item.queryParams.id);
                },
                permissionName: 'Pages.Administration.OrgUnits.Create',
                visible: rowNode.data.level < 7
            },
            {
                tooltipOptions: {
                    tooltipLabel: self.l('OrgUnits.OrgUnit.Users'),
                    tooltipPosition: 'top'
                },
                icon: 'fa fa-fw fa-user',
                queryParams: rowNode,
                command: (event) => {
                    self.configPersons(event.item.queryParams);
                },
                permissionName: 'Pages.Administration.OrgUnits.Edit'
            }
        ];

        return self.getGrantedMenuItems(ll);
    }
}
