import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, LazyLoadEvent, MenuItem } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import { DateTimeService } from 'src/shared/services/datetime.service';
import { NumberFormatter } from 'src/shared/utils/numberformatter.class';
import { AppPermissions } from '../../shared/AppPermissions';
import {
    CatalogCustomImplDeleteCommand,
    CatalogCustomImplGetListQuery,
    CatalogCustomImplServiceProxy,
    CatalogCustomResponse,
    CatalogCustomServiceProxy,
    QuestionnaireFieldResponse,
    QuestionnaireFieldType,
    QuestionnaireServiceProxy
} from '../../shared/service-proxies/service-proxies';
import { AppComponent } from '../app.component';

@Component({
    templateUrl: './catalogscustomimpl.component.html',
    styleUrls: ['../../assets/css-custom/p-datatable-general.scss']
})
export class CatalogsCustomImplComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    data: any;
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    catalogId: string = null;
    catalog = new CatalogCustomResponse();
    questionnaireFields: QuestionnaireFieldResponse[];
    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    loadingCatalog = false;
    loadingQuestionnaireFields = false;
    query: CatalogCustomImplGetListQuery = new CatalogCustomImplGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey: string;

    QuestionnaireFieldType = QuestionnaireFieldType;

    permissions = { create: false, edit: false, delete: false };
    title = '';

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: CatalogCustomImplServiceProxy,
        private serviceCatalogCustom: CatalogCustomServiceProxy,
        private serviceQuestionnaire: QuestionnaireServiceProxy,
        private confirmationService: ConfirmationService,
        private dateTimeService: DateTimeService,
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

        self.catalogId = self.activatedRoute.snapshot.params['catalog'];
        self.permissions.create = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForCatalogCustom(
                AppPermissions.catalogsCustomCreate, self.catalogId, self.app.currentUser.tenantId)
        );
        self.permissions.edit = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForCatalogCustom(
                AppPermissions.catalogsCustomEdit, self.catalogId, self.app.currentUser.tenantId)
        );
        self.permissions.delete = self.permission.isGranted(
            AppPermissions.calculatePermissionNameForCatalogCustom(
                AppPermissions.catalogsCustomDelete, self.catalogId, self.app.currentUser.tenantId)
        );

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-catalogcustom_' + self.catalogId);
        self.browserStorageTableFilterKey = 'table-catalogcustom_' + self.catalogId + '-filters';
        self.query.catalog = self.catalogId;

        self.getCatalog(self.catalogId);

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });
    }

    getCatalog(catalog: string): void {
        const self = this;

        self.loadingCatalog = true;

        self.serviceCatalogCustom.getCatalogCustom(catalog)
            .pipe(finalize(() => {
                self.loadingCatalog = false;
            }))
            .subscribe(data => {
                self.getQuestionnaire(data.questionnaire);
                self.catalog = data;

                self.title = self.catalog.namePlural;

                self.initializeCols();
            });
    }

    getQuestionnaire(questionnaire: string): void {
        const self = this;

        self.loadingQuestionnaireFields = true;

        self.serviceQuestionnaire.getQuestionnaire(questionnaire)
            .pipe(finalize(() => {
                self.loadingQuestionnaireFields = false;
            }))
            .subscribe(data => {
                self.questionnaireFields = data.sections.flatMap(p => p.fields);

                self.initializeCols();
            });
    }

    calculateColumnWidth(field: QuestionnaireFieldResponse): number {
        let width = 180;

        switch (field.fieldType) {
            case QuestionnaireFieldType.Boolean:
            case QuestionnaireFieldType.Time:
                width = 100;
                break;
            case QuestionnaireFieldType.Date:
                width = 120;
                break;
            case QuestionnaireFieldType.Integer:
            case QuestionnaireFieldType.Decimal:
            case QuestionnaireFieldType.DateTime:
                width = 150;
                break;
            case QuestionnaireFieldType.GoogleAddress:
                width = 250;
                break;
            case QuestionnaireFieldType.Multivalue:
                width = 300;
                break;
        }

        return width;
    }

    initializeCols(): void {
        const self = this;

        if (self.catalog && self.questionnaireFields) {
            self.cols = [];

            self.cols = self.cols.concat(self.questionnaireFields
                .filter(p => self.catalog.fieldNames.some(q => q === p.fieldName)).sort((f1, f2) => f1.order - f2.order)
                .map(p => ({
                    field: p.fieldName,
                    header: p.name,
                    fieldType: p.fieldType,
                    fieldSize: p.fieldSize,
                    width: self.calculateColumnWidth(p) + 'px'
                })));
        }
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

        self.service.getCatalogCustomImplList(self.query)
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
        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '_id DESC';
        self.getList();
    }

    create(): void {
        const self = this;

        self.router.navigate(['/app/catalogscustomimpl', self.catalogId, 'create']);
    }

    consult(id: number): void {
        const self = this;

        self.router.navigate(['/app/catalogscustomimpl', self.catalogId, 'consult', id]);
    }

    edit(id: number): void {
        const self = this;

        self.router.navigate(['/app/catalogscustomimpl', self.catalogId, 'edit', id]);
    }

    delete(id: string): void {
        const self = this;

        self.alertService.confirm(
            self.l('ConfirmationSoftDeleteRecordMessage'), self.l('Confirmation'),
            function () {
                self.app.blocked = true;

                self.service.deleteCatalogCustomImpl(new CatalogCustomImplDeleteCommand({ id: id, catalog: self.catalogId }))
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            }
        );
    }

    createMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                tooltipOptions: {
                    tooltipLabel: self.l('Consult'),
                    tooltipPosition: 'top'
                },
                icon: 'pi pi-eye',
                queryParams: rowData,
                command: (event) => {
                    self.consult(event.item.queryParams.Id);
                }
            }
        ];

        return self.getGrantedMenuItems(ll);
    }

    transformColumnValueToDisplay(value: any, col: any): any {
        const self = this;
        let res = typeof value === 'object' ? null : value;

        if (value) {
            const formatter = new NumberFormatter();

            switch (col.fieldType) {
                case QuestionnaireFieldType.Integer:
                    res = formatter.format(value, 0);
                    break;
                case QuestionnaireFieldType.Decimal:
                    res = formatter.format(value, col.fieldSize ? col.fieldSize : 2);
                    break;
                case QuestionnaireFieldType.Date:
                    res = self.dateTimeService.getDateStringISOToFormat(value);
                    break;
                case QuestionnaireFieldType.DateTime:
                    res = self.dateTimeService.getDateTimeStringISOToFormat(value);
                    break;
            }
        }

        return res;
    }

    canEdit(rowData: any): boolean {
        const self = this;

        return self.permissions.edit;
    }

    canDelete(rowData: any): boolean {
        const self = this;

        return self.permissions.delete;
    }
}

