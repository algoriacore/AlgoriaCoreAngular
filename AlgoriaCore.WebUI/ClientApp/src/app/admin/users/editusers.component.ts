import { Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, first } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    RolForListActiveResponse,
    RolGetForListActiveQuery,
    RolServiceProxy,
    UserCreateCommand,
    UserForEditResponse,
    UserGetForEditQuery,
    UserServiceProxy,
    UserUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './editusers.component.html'
})
export class EditUsersComponent extends AppComponentBase implements OnInit {
    @ViewChild('name', { static: false }) inputFocus: ElementRef;
    form: FormGroup;

    id?: number = null;
    model: UserForEditResponse;
    roleList: RolForListActiveResponse[] = [];
    isactive: boolean;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private userService: UserServiceProxy,
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

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.prepareForm();

        if (self.id) {
            self.getForEdit(self.id);
        } else {
            self.getRoles();
        }
    }

    getForEdit(id: number): void {
        const self = this;
        const query = new UserGetForEditQuery();

        query.id = self.id;
        self.app.blocked = true;

        self.userService.getUserForEdit(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;

                self.f.name.setValue(self.model.name);
                self.f.lastname.setValue(self.model.lastName);
                self.f.secondlastname.setValue(self.model.secondLastName);
                self.f.emailaddress.setValue(self.model.emailAddress);
                self.f.phonenumber.setValue(self.model.phoneNumber);
                self.f.username.setValue(self.model.userName);
                self.f.setrandompassword.setValue(self.model.setRandomPassword);
                self.f.shouldchangepasswordonnextlogin.setValue(self.model.shouldChangePasswordOnNextLogin);
                self.f.isactive.setValue(self.model.isActive);

                self.getRoles();
            });
    }

    save(): void {
        const self = this;

        if (self.model) {
            const updateCmd = new UserUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.name = self.f.name.value;
            updateCmd.lastName = self.f.lastname.value;
            updateCmd.secondLastName = self.f.secondlastname.value;
            updateCmd.emailAddress = self.f.emailaddress.value;
            updateCmd.phoneNumber = self.f.phonenumber.value;
            updateCmd.userName = self.f.username.value;
            updateCmd.setRandomPassword = self.f.setrandompassword.value;
            updateCmd.password = self.f.password.value;
            updateCmd.passwordRepeat = self.f.passwordrepeat.value;
            updateCmd.shouldChangePasswordOnNextLogin = self.f.shouldchangepasswordonnextlogin.value;
            updateCmd.isActive = self.f.isactive.value;
            updateCmd.assignedRoleNames = self.getCheckedRoles();

            self.app.blocked = true;

            self.userService.updateUser(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new UserCreateCommand();

            createCmd.name = self.f.name.value;
            createCmd.lastName = self.f.lastname.value;
            createCmd.secondLastName = self.f.secondlastname.value;
            createCmd.emailAddress = self.f.emailaddress.value;
            createCmd.phoneNumber = self.f.phonenumber.value;
            createCmd.userName = self.f.username.value;
            createCmd.setRandomPassword = self.f.setrandompassword.value;
            createCmd.password = self.f.password.value;
            createCmd.passwordRepeat = self.f.passwordrepeat.value;
            createCmd.shouldChangePasswordOnNextLogin = self.f.shouldchangepasswordonnextlogin.value;
            createCmd.isActive = self.f.isactive.value;
            createCmd.assignedRoleNames = self.getCheckedRoles();

            self.app.blocked = true;

            self.userService.createUser(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Users.UserSuccessfullyCreated'), self.l('Success'));
                    self.prepareForm();
                });
        }
    }

    prepareForm(): void {
        const self = this;

        self.form = self.formBuilder.group({
            name: [''],
            lastname: [''],
            secondlastname: [''],
            emailaddress: [''],
            phonenumber: [''],
            username: [''],
            setrandompassword: [false],
            password: [''],
            passwordrepeat: [''],
            shouldchangepasswordonnextlogin: [false],
            isactive: [true],
            roles: []
        });

        // focus
        setTimeout(() => this.inputFocus.nativeElement.focus(), 100);
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('User', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/users']);
    }

    getRoles(): void {
        const self = this;

        self.rolService.getRolListActive(new RolGetForListActiveQuery())
            .pipe(first())
            .subscribe(data => {
                self.roleList = data;

                if (self.model) {
                    const lista = [];
                    for (let i = 0; i < self.model.rolList.length; i++) {
                        lista.push(self.model.rolList[i].roleName);
                    }
                    self.f.roles.setValue(lista);
                }
            });
    }

    getCheckedRoles(): any {
        const self = this;

        const list = [];

        if (self.f.roles.value && self.f.roles.value.length) {
            for (let i = 0; i < self.f.roles.value.length; i++) {
                list.push(self.f.roles.value[i]);
            }
        }

        return list;
    }

    onClickSetRandomPassword(): void {
        const self = this;

        if (self.f.setrandompassword.value) {
            self.f.password.setValue('');
            self.f.passwordrepeat.setValue('');
        }
    }
}
