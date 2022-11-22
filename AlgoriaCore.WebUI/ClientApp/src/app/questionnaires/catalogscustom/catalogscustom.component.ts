import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    CatalogCustomForListResponse,
    CatalogCustomGetListQuery,
    CatalogCustomServiceProxy
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './catalogscustom.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class CatalogsCustomComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: CatalogCustomForListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: CatalogCustomGetListQuery = new CatalogCustomGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-catalogcustom-filters';

    permissions: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: CatalogCustomServiceProxy,
        private app: AppComponent,
        private dateTimeService: DateTimeService
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
            create: self.permission.isGranted('Pages.CatalogsCustom.Create'),
            edit: self.permission.isGranted('Pages.CatalogsCustom.Edit'),
            delete: self.permission.isGranted('Pages.CatalogsCustom.Delete')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-catalogcustom');

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'nameSingular', header: this.l('CatalogsCustom.CatalogCustom.NameSingular') },
            { field: 'userCreator', header: this.l('CatalogsCustom.CatalogCustom.UserCreator') },
            { field: 'creationDateTime', header: this.l('CatalogsCustom.CatalogCustom.CreationDateTime') },
            { field: 'isCollectionGeneratedDesc', header: this.l('CatalogsCustom.CatalogCustom.IsCollectionGenerated'), width: '100px' },
            { field: 'isActiveDesc', header: this.l('IsActive'),  width: '100px' }
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

        self.service.getCatalogCustomList(self.query)
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

        if (event.sortField) {
            self.query.sorting = event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC');
        } else {
            self.query.sorting = 'creationTime DESC';
        }

        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    create(): void {
        this.router.navigate(['/app/questionnaires/catalogscustom/create']);
    }

    edit(id: string): void {
        this.router.navigate(['/app/questionnaires/catalogscustom/edit', id]);
    }

    delete(id: string): void {
        const self = this;

        self.alertService.confirm(self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteCatalogCustom(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            });
    }
}
