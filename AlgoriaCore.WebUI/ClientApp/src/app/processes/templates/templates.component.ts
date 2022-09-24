import { ChangeDetectorRef, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { first, finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { TemplatesServiceProxy, TemplateForListResponse } from '../../../shared/service-proxies/service-proxies';
import { MenuItem, ConfirmationService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './templates.component.html',
    styleUrls: ['./templates.component.css']
})
export class TemplatesComponent extends AppComponentBase implements OnInit {

    @ViewChild('menu', { static: false }) btnMenu: Menu;

    items: MenuItem[];

    data: TemplateForListResponse[] = [];
    dateNow: Date;
    urlLogo: string;

    permissions: any;

    constructor(
        private router: Router,
        private service: TemplatesServiceProxy,
        private cdRef: ChangeDetectorRef,
        injector: Injector,
        private confirmationService: ConfirmationService,
        private app: AppComponent
    ) {
        super(injector);
    }

    ngOnInit() {
        const self = this;

        self.permissions = {
            create: self.permission.isGranted('Pages.Processes.Templates.Create'),
            edit: self.permission.isGranted('Pages.Processes.Templates.Edit'),
            delete: self.permission.isGranted('Pages.Processes.Templates.Delete')
        };

        self.getList();
    }

    getList() {
        const self = this;

        self.app.blocked = true;

        self.service.getTemplateNoPagedList()
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.data = data;
            });
    }

    create(): void {
        this.router.navigate(['/app/processes/templates/create']);
    }

    edit(id: number): void {
        this.router.navigate(['/app/processes/templates/edit', id]);
    }

    delete(id: number): void {
        const self = this;

        self.confirmationService.confirm({
            header: self.l('Confirmation'),
            icon: 'pi pi-exclamation-triangle',
            message: self.l('ConfirmationDeleteRecordMessage'),
            acceptLabel: self.l('Yes'),
            rejectLabel: self.l('No'),
            accept: () => {
                self.app.blocked = true;

                self.service.deleteTemplate(id)
                    .pipe(finalize(() => {
                        self.app.blocked = false;
                    }))
                    .subscribe(data => {
                        self.notify.success(self.l('RecordDeletedSuccessful'), self.l('Success'));
                        self.getList();
                    });
            }
        });
    }

    templatesColor(colorRGB: string) {
        let color = '#';

        color = color.concat(colorRGB);

        return color;
    }

    updateLocalIconImage(uuid: string): string {
        const self = this;

        return self.getBaseServiceUrl() + '/api/File/GetFile?uuid=' + uuid;
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
                label: this.l('Edit'),
                icon: 'fa fa-fw fa-edit',
                queryParams: rowData,
                command: (event) => {
                    self.edit(event.item.queryParams.id);
                },
                permissionName: 'Pages.Processes.Templates.Edit'
            },
            {
                label: this.l('Delete'),
                icon: 'pi pi-fw pi-times',
                queryParams: rowData,
                command: (event) => {
                    self.delete(event.item.queryParams.id);
                },
                permissionName: 'Pages.Processes.Templates.Delete'
            }
        ];

        return self.getGrantedMenuItems(ll);
    }
}
