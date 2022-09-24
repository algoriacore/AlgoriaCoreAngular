import { AfterContentInit, Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FileUpload } from 'primeng/fileupload';
import { Message } from 'primeng/api';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { AppConsts } from '../../../shared/AppConsts';
import { AppSettings } from '../../../shared/AppSettings';
import {
    ComboboxItemDto,
    FileServiceProxy,
    RolForListActiveResponse,
    UserForEditResponse,
    UserProfileQuery,
    UserServiceProxy,
    UserUpdateProfileCommand
} from '../../../shared/service-proxies/service-proxies';
import { DateTimeService } from '../../../shared/services/datetime.service';
import { AppComponent } from '../../app.component';
import { AfterViewInit } from '@angular/core';

@Component({
    templateUrl: './userprofile.component.html'
})
export class UserProfileComponent extends AppComponentBase implements OnInit {

    @ViewChild('fileUpload', { static: false }) fileUpload: FileUpload;

    usuarioForm: FormGroup;

    id?: number = null;
    model: UserForEditResponse;
    roleList: RolForListActiveResponse[] = [];
    isactive: boolean;
    uploadedFiles: any[] = [];
    msgs: Message[];
    urlLogo: string;
    urlLogoTemp: string = null;
    tempFileName: string;

    languageCombo: ComboboxItemDto[] = [];
    timeZoneCombo: ComboboxItemDto[] = [];
    appThemeCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private dateTimeService: DateTimeService,
        private userService: UserServiceProxy,
        private fileService: FileServiceProxy,
        public app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.usuarioForm.controls;
    }

    ngOnInit() {
        const self = this;

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        self.timeZoneCombo = self.getTimeZoneCombo();
        self.appThemeCombo = self.getAppThemeCombo();

        const timeZone: string = self.dateTimeService.getTimeZone();

        self.usuarioForm = self.formBuilder.group({
            name: [''],
            lastname: [''],
            secondlastname: [''],
            emailaddress: [''],
            phonenumber: [''],
            currentpassword: [''],
            newpassword: [''],
            newpasswordconfirm: [''],
            language: [null],
            timeZone: [timeZone],
            appTheme: ['algoriacore']
        });

        self.getUserProfile();
    }

    getTimeZoneCombo(): ComboboxItemDto[] {
        const self = this;
        const timeZoneCombo: ComboboxItemDto[] = [];

        for (const tz of self.dateTimeService.getAvailableZones()) {
            timeZoneCombo.push(new ComboboxItemDto({ value: tz, label: tz }));
        }

        return timeZoneCombo;
    }

    getAppThemeCombo(): ComboboxItemDto[] {
        const self = this;
        const appThemeCombo: ComboboxItemDto[] = [];

        appThemeCombo.push(new ComboboxItemDto({
            value: 'algoriacore', label: self.l('Users.Preferences.Design.AppTheme.AlgoriaCore')
        }));

        return appThemeCombo;
    }

    getUserProfile(): void {
        const self = this;
        const query = new UserProfileQuery();

        query.id = 0;
        query.clientType = AppConsts.clientType;

        self.app.blocked = true;

        self.userService.getUserProfile(query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
                self.languageCombo = data.languageCombo;

                setTimeout(() => {
                    self.f.name.setValue(self.model.name);
                    self.f.lastname.setValue(self.model.lastName);
                    self.f.secondlastname.setValue(self.model.secondLastName);
                    self.f.emailaddress.setValue(self.model.emailAddress);
                    self.f.phonenumber.setValue(self.model.phoneNumber);

                    self.updateLocalImageProfile();

                    if (data.language) {
                        self.f.language.setValue(data.language.toString());
                    }

                    self.setPreferences(data.preferences);
                }, 0);

            });
    }

    setPreferences(preferences: { [key: string]: string }): void {
        const self = this;

        self.f.timeZone.setValue(preferences[AppSettings.timeZone]);
        self.f.appTheme.setValue(preferences[AppSettings.appTheme]);
    }

    updateLocalImageProfile(): void {
        this.urlLogo = this.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' + this.model.id + '&v' + (new Date().getTime());

        // El siguiente método invocado está en el AppComponentBase
        this.updateImageProfile();
    }

    save(): void {
        const self = this;
        const updateCmd = new UserUpdateProfileCommand();

        updateCmd.name = self.f.name.value;
        updateCmd.lastName = self.f.lastname.value;
        updateCmd.secondLastName = self.f.secondlastname.value;
        updateCmd.emailAddress = self.f.emailaddress.value;
        updateCmd.phoneNumber = self.f.phonenumber.value;

        updateCmd.pictureName = self.tempFileName;

        updateCmd.currentPassword = self.f.currentpassword.value;
        updateCmd.newPassword = self.f.newpassword.value;
        updateCmd.newPasswordConfirm = self.f.newpasswordconfirm.value;

        updateCmd.clientType = AppConsts.clientType;
        updateCmd.language = self.f.language.value;

        updateCmd.preferences = {};
        updateCmd.preferences[AppSettings.timeZone] = self.f.timeZone.value;
        updateCmd.preferences[AppSettings.appTheme] = self.f.appTheme.value;

        self.app.blocked = true;

        self.userService.updateUserProfile(updateCmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.updateLocalImageProfile();
                self.notify.success(self.l('SavedSuccessfully'), self.l('Success'));
                this.urlLogoTemp = null;

                self.alertService.confirm(self.l('Users.Profile.ReloadMessage'), function () {
                    window.location.reload();
                });
            });
    }

    myUploader(event): void {

        const self = this;

        if (event.files.length === 0) {
            console.log('No file selected.');
            return;
        }

        const fileToUpload = event.files[0];

        const input = {
            data: fileToUpload,
            fileName: fileToUpload.name
        };

        self.fileService.uploadTemp(input)
            .pipe(finalize(() => {  }))
            .subscribe(data => {
                this.fileUpload.clear();
                this.tempFileName = data.tempFileName;
                this.updateImgTemp(data.tempFileName);
            });
    }

    updateImgTemp(fileName): void {
        this.urlLogoTemp = this.getBaseServiceUrl() + '/api/File/GetFileTemp?tempFileName=' + fileName;
    }

    onUpload(event): void {}
}
