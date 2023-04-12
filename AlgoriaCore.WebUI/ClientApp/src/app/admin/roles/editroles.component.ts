import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    Permission,
    PermissionServiceProxy,
    RoleCreateCommand,
    RoleForEditReponse,
    RoleGetForEditQuery,
    RoleServiceProxy,
    RoleUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './editroles.component.html'
})
export class EditRolesComponent extends AppComponentBase implements OnInit {

    @ViewChild('name', { static: false }) inputFocus: ElementRef;
    form: FormGroup;

    treeNodes: TreeNode[] = [];
    selectedNodes: TreeNode[] = [];
    id?: number = null;
    model: RoleForEditReponse;
    isActive: boolean;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private roleService: RoleServiceProxy,
        private permissionService: PermissionServiceProxy,
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

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        } else {
            self.getPermissions();
        }
    }

    getForEdit(id: number): void {
        const self = this;
        const query = new RoleGetForEditQuery();

        query.id = self.id;
        self.app.blocked = true;

        self.roleService.getRoleForEdit(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.id = data.id;
                self.model = data;

                self.f.name.setValue(self.model.name);
                self.f.displayName.setValue(self.model.displayName);
                self.f.isActive.setValue(self.model.isActive);

                self.getPermissions();
            });
    }

    save(): void {
        const self = this;

        if (self.id) {
            const updateCmd = new RoleUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.displayName = self.f.displayName.value;
            updateCmd.isActive = self.f.isActive.value;
            updateCmd.grantedPermissionNames = self.getCheckedPermissions();

            self.app.blocked = true;

            self.roleService.updateRole(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new RoleCreateCommand();

            createCmd.name = self.f.name.value;
            createCmd.displayName = self.f.displayName.value;
            createCmd.isActive = self.f.isActive.value;
            createCmd.grantedPermissionNames = self.getCheckedPermissions();

            self.app.blocked = true;

            self.roleService.createRole(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.prepareForm();
                });
        }
    }

    getPermissions(): void {
        const self = this;

        self.app.blocked = true;

        self.permissionService.getPermissionsTree()
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.treeNodes.push(self.createTreeNode(data));
            });
    }

    prepareForm(): void {
        const self = this;

        self.form = self.formBuilder.group({
            name: ['', [Validators.required, Validators.maxLength(50)]],
            displayName: ['', [Validators.required, Validators.maxLength(100)]],
            isActive: [true]
        });

        self.selectedNodes = [];

        // focus
        setTimeout(() => this.inputFocus.nativeElement.focus(), 100);
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Role', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/roles']);
    }

    createTreeNode(nodo: Permission): any {
        const self = this;

        const json = {};
        json['label'] = nodo.displayName;
        json['expandedIcon'] = 'fa fa-folder-open-o';
        json['collapsedIcon'] = 'fa fa-folder';
        json['data'] = nodo.name;
        json['children'] = [];

        if (nodo.children != null && nodo.children.length > 0) {
            json['expanded'] = true;

            for (const child of nodo.children) {
                json['children'].push(self.createTreeNode(child));
            }
        } else {
            json['icon'] = 'fa fa-file-o';
        }

        if (self.model && self.model.permissionList) {
            for (const permiso of self.model.permissionList) {
                if (permiso.name === nodo.name) {
                    self.selectedNodes.push(json);
                }
            }
        }

        return json;
    }

    getCheckedPermissions(): any {
        const self = this;

        const list = [];

        if (self.selectedNodes !== null && self.selectedNodes.length > 0) {
            for (const selectedNode of self.selectedNodes) {
                list.push(selectedNode.data);
            }
        }

        return list;
    }
}
