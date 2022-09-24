import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LazyLoadEvent, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { finalize } from 'rxjs/operators';
import { AppComponentBase, PagedTableSummary } from 'src/app/app-component-base';
import {
    MailServiceMailAttachGetFileQuery,
    MailServiceMailAttachGetListQuery,
    MailServiceMailAttachListResponse,
    MailServiceMailAttachServiceProxy
} from 'src/shared/service-proxies/service-proxies';
import { FileService } from 'src/shared/services/file.service';
import { AppComponent } from '../../app.component';

@Component({
    selector: 'app-mailservicemailattach-grid',
    templateUrl: './mailservicemailattach.component.html',
    styleUrls: ['../../../assets/css-custom/p-datatable-general.scss']
})

export class MailServiceMailAttachComponent extends AppComponentBase implements OnInit {

    @ViewChild('menu', { static: false }) btnMenu: Menu;
    @ViewChild('dt1', { static: false }) table;

    @Input() mailServiceMailBodyId: number;

    form: FormGroup;

    data: MailServiceMailAttachListResponse[];
    pagedTableSummary: PagedTableSummary = new PagedTableSummary();

    cols: any[];
    selectedItem: any;
    items: MenuItem[];
    query: MailServiceMailAttachGetListQuery = new MailServiceMailAttachGetListQuery();

    browserStorageTableKey: string;
    browserStorageTableFilterKey = 'table-mailservicemailattach-filters';
    permissions: any;

    constructor(
        injector: Injector,
        private fileService: FileService,
        private formBuilder: FormBuilder,
        private router: Router,
        private service: MailServiceMailAttachServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    get f() {
        return this.form.controls;
    }

    ngOnInit() {

        const self = this;

        self.browserStorageTableKey = self.browserStorageService.calculateKey('table-mailservicemailattach');

        const filters: any = self.getFilters(self.browserStorageTableFilterKey);
        self.form = self.formBuilder.group({
            filterText: [filters.filter]
        });

        self.cols = [
            { field: 'contenType', header: this.l('MailServiceMailAttachs.MailServiceMailAttach.ContenType') },
            { field: 'fileName', header: this.l('MailServiceMailAttachs.MailServiceMailAttach.FileName') },

        ];

        self.query.pageSize = 10;
        self.query.sorting = 'id';
        self.query.pageNumber = 1;
        self.query.mailServiceMailBody = self.mailServiceMailBodyId;
        console.log(self.query);

    }

    filterSearch(): void {
        const self = this;

        self.browserStorageService.remove(self.browserStorageTableKey);
        self.query.pageNumber = 1;
        self.table.reset();
    }

    getList(): void {
        const self = this;

        self.query.filter = self.f.filterText.value;

        self.app.blocked = true;

        self.service.getMailServiceMailAttachPagedList(self.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data.items;
                self.pagedTableSummary = self.getPagedTableSummay(data.totalCount, self.query.pageNumber, self.query.pageSize);
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

    downloadFile(id: number): void {
        const self = this;
        self.getFile(id);
    }

    getFile(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getMailServiceMailAttachFile(new MailServiceMailAttachGetFileQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {

                const splittedName = data.fileName.split('.');
                const filename = splittedName[0];
                const extension = splittedName[1];
                self.fileService.createAndDownloadBlobFileFromBase64(data.base64File, filename, extension);
            });
    }

    createAndShowMenu(event: any, rowData: any): void {
        const self = this;

        self.items = self.createMenuItems(rowData);
        self.btnMenu.toggle(event);

    }

    createMenuItems(rowData: any): MenuItem[] {
        const self = this;

        const ll = [
            {
                label: self.l('Download'),
                icon: 'fa fa-fw fa fa-download',
                queryParams: rowData,
                command: (event) => {
                    self.downloadFile(event.item.queryParams.id);
                },
                permissionName: 'Pages.Administration.MailServiceMailAttach'
            }
        ];

        return self.getGrantedMenuItems(ll);
    }
}

