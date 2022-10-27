import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import {
    MailGroupServiceProxy, MailTemplateForEditResponse, MailTemplateGetForEditQuery, MailTemplateGetListQuery,
    MailTemplateListResponse, MailTemplateUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponentBase, PagedTableSummary } from '../../app-component-base';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './emailtemplates.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})
export class EmailTemplatesComponent extends AppComponentBase implements OnInit {

    @ViewChild('dt1', { static: false }) table;
    @ViewChild('fileUpload', { static: false }) fileUpload: FileUpload;
    @ViewChild('fileDiv', { static: false }) fileDiv: ElementRef;

    form: FormGroup;
    model: MailTemplateForEditResponse;

    grupo: number = null;
    data: MailTemplateListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: MailTemplateGetListQuery = new MailTemplateGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-mailtemplate-filters';
    idTemplate: number;

    permissions: any;

    constructor(
        injector: Injector,
        private activatedRoute: ActivatedRoute,
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
            create: self.permission.isGranted('conftcor.5'),
            edit: self.permission.isGranted('conftcor.6'),
            loadHTML: self.permission.isGranted('conftcor.8')
        };

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-mailtemplate');
        self.grupo = this.activatedRoute.snapshot.params['group'] ? Number(self.activatedRoute.snapshot.params['group']) : null;

        // Asigno los filtro guardados en localStorage
        const filters: any = self.getFilters(self.browserStorageTableFilterKey);

        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'id', header: self.l('Id'), width: '100px' },
            { field: 'mailKeyDesc', header: self.l('EmailTemplates.MailKeyColGrid') },
            { field: 'displayName', header: self.l('EmailTemplates.DisplayNameColGrid') }
        ];

        self.query.mailGroup = self.grupo;
    }

    myUploader(event): void {
        const self = this;

        if (event.files.length === 0) {
            console.log('No file selected.');
            return;
        }

        const fileToUpload = event.files[0];

        if (fileToUpload) {
            const r = new FileReader();
            r.onload = function (e) {
                const contents = r.result;

                const updateCmd = new MailTemplateUpdateCommand();
                updateCmd.id = self.idTemplate;
                updateCmd.mailGroup = self.model.mailGroup;
                updateCmd.displayName = self.model.displayName;
                updateCmd.mailKey = self.model.mailKey;
                updateCmd.sendTo = self.model.sendTo;
                updateCmd.copyTo = self.model.copyTo;
                updateCmd.blindCopyTo = self.model.blindCopyTo;
                updateCmd.subject = self.model.subject;
                updateCmd.body = contents.toString();
                updateCmd.isActive = self.model.isActive;

                self.app.blocked = true;

                self.mailGroupService.updateMailTemplate(updateCmd)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    });
            };
            r.readAsText(fileToUpload);
        } else {
            self.notify.error(self.l('ProductMailTemplates.ErrorHTMLTemplate'), self.l('Error'));
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

        self.mailGroupService.getMailTemplateList(self.query)
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
        this.router.navigate(['/app/admin/emailtemplates/group', this.grupo, 'create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/admin/emailtemplates/group', this.grupo, 'edit', id]);
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        const query = new MailTemplateGetForEditQuery();
        query.id = id;

        self.mailGroupService.getMailTemplateForEdit(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
            });
    }

    loadHTML(id: number): void {
        const self = this;

        self.idTemplate = id;
        self.getForEdit(self.idTemplate);
        self.fileDiv.nativeElement.children[0].children[0].children[1].children[2].click();
    }

    return() {
        const self = this;

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.browserStorageService.remove(self.browserStorageTableFilterKey);
        this.router.navigate(['/app/admin/emailgroups']);
    }
}
