import { Component, Injector, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent } from 'primeng/api/lazyloadevent';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    LanguageCreateCommand,
    LanguageForEditResponse,
    LanguageGetForEditQuery,
    LanguageServiceProxy,
    LanguageTextForEditResponse,
    LanguageTextForListResponse,
    LanguageTextGetListQuery,
    LanguageUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';
import { EditLanguageTextsComponent } from './texts/editlanguagetexts.component';

@Component({
    templateUrl: './editlanguages.component.html'
})
export class EditLanguagesComponent extends AppComponentBase implements OnInit {
    @ViewChild('name', { static: false }) inputFocus: ElementRef;
    @ViewChild('dt1', { static: false }) table;

    form: FormGroup;

    id?: number = null;
    model: LanguageForEditResponse = null;
    fieldLabels: any = {};

    filteredLanguageCombo: ComboboxItemDto[];

    permissions: any;

    // TEXTOS
    data: LanguageTextForListResponse[];
    cols: any[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();
    query: LanguageTextGetListQuery = new LanguageTextGetListQuery();
    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-languagetext-filters';

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: LanguageServiceProxy,
        private formService: FormService,
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
            edit: self.permission.isGranted('Pages.Administration.Languages.Edit'),
            changeTexts: self.permission.isGranted('Pages.Administration.Languages.ChangeTexts')
        };

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-languagetext');

        this.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);

            if (self.permissions.changeTexts) {
                // Asigno los filtro guardados en localStorage
                const filters: any = self.getFilters(self.browserStorageTableFilterKey);

                self.form.addControl('filterText', new FormControl(filters.filter));

                self.cols = [
                    { field: 'key', header: this.l('Languages.Texts.Text.Key') },
                    { field: 'value', header: this.l('Languages.Texts.Text.Value') }
                ];

                self.query.languageId = self.id;
            }
        }
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            name: this.l('Languages.Language.Name'),
            displayName: this.l('Languages.Language.DisplayName')
        };

        self.form = self.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(10)]],
            displayName: ['', [Validators.required, Validators.maxLength(100)]],
            isActive: [true]
        });

        setTimeout(() => this.inputFocus.nativeElement.focus(), 100);
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getLanguageForEdit(new LanguageGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(data.name);
                self.f.displayName.setValue(data.displayName);
                self.f.isActive.setValue(data.isActive);
            });
    }

    save(): void {
        const self = this;

        // stop here if form is invalid
        if (self.form.invalid) {
            this.formService.showErrors(self.form, self.fieldLabels);
            return;
        }

        if (self.id) {
            const updateCmd = new LanguageUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.displayName = self.f.displayName.value;
            updateCmd.isActive = self.f.isActive.value;

            self.app.blocked = true;

            self.service.updateLanguage(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Confirmation'));
                    self.return();
                });
        } else {
            const createCmd = new LanguageCreateCommand();

            createCmd.name = self.f.name.value;
            createCmd.displayName = self.f.displayName.value;
            createCmd.isActive = self.f.isActive.value;

            self.app.blocked = true;

            self.service.createLanguage(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Confirmation'));

                    if (self.permission.isGranted('Pages.Administration.Languages.Edit')) {
                        self.router.navigate(['/app/admin/languages/edit', data]);
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

    filterLanguageCombo(event) {
        const self = this;

        self.filteredLanguageCombo = [];

        for (let i = 0; i < self.model.languageCombo.length; i++) {
            const item = self.model.languageCombo[i];

            if (item.label.toLowerCase().indexOf(event.query.toLowerCase()) === 0) {
                this.filteredLanguageCombo.push(item);
            }
        }
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Language', self.id);
    }

    return(): void {
        const self = this;

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.browserStorageService.remove(self.browserStorageTableFilterKey);

        self.router.navigate(['/app/admin/languages']);
    }

    // TEXTOS
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

        self.service.getLanguageTextList(self.query)
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

        self.query.sorting = event.sortField ? (event.sortField + ' ' + (event.sortOrder === 1 ? 'ASC' : 'DESC')) : '';
        self.query.pageNumber = 1 + (event.first / event.rows);
        self.query.pageSize = event.rows;

        self.getList();
    }

    edit(record: LanguageTextForListResponse): void {
        const self = this;

        const ref = self.dialogService.open(EditLanguageTextsComponent, {
            styleClass: 'd-xl-40 d-lg-70 d-md-75 d-sm',
            showHeader: true,
            header: self.l('Languages.Texts.Text.Edit'),
            closeOnEscape: false,
            dismissableMask: false,
            data: new LanguageTextForEditResponse({
                id: record.id,
                languageId: record.languageId,
                languageDesc: self.model.displayName,
                key: record.key,
                value: record.value
            })
        });

        ref.onClose.subscribe((isEdited = false) => {
            if (isEdited) {
                self.getList();
            }
        });
    }

    showTextChangeHistory(id: number): void {
        const self = this;
        console.log(id);
        self.changeLogService.open('LanguageText', id);
    }
}
