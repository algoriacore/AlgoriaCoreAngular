import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    ComboboxItemDto,
    HelpCreateCommand,
    HelpForEditResponse,
    HelpGetForEditQuery,
    HelpServiceProxy,
    HelpUpdateCommand
} from '../../../shared/service-proxies/service-proxies';
import { FormService } from '../../../shared/services/form.service';
import { AppComponent } from '../../app.component';
import { ChangeLogService } from '../../_services/changelog.service';

@Component({
    templateUrl: './edithelps.component.html'
})
export class EditHelpsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    id?: number = null;
    model: HelpForEditResponse = null;
    fieldLabels: any = {};

    languageCombo: ComboboxItemDto[] = [];
    keyCombo: ComboboxItemDto[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: HelpServiceProxy,
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

        if (self.activatedRoute.snapshot.url.length > 1 && self.activatedRoute.snapshot.url[1].path === 'edit') {
            self.id = self.activatedRoute.snapshot.params['id'] ? Number(self.activatedRoute.snapshot.params['id']) : null;
        }

        this.prepareForm();

        self.getForEdit(self.id);
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            language: self.l('Helps.Help.Language'),
            key: self.l('Helps.Help.Key'),
            displayName: self.l('Helps.Help.DisplayName'),
            body: self.l('Body')
        };

        self.form = self.formBuilder.group({
            language: [null, [Validators.required]],
            key: [null, [Validators.required]],
            displayName: ['', [Validators.required, Validators.maxLength(100)]],
            isActive: [true],
            body: ['', [Validators.required]]
        });
    }

    getForEdit(id: number): void {
        const self = this;

        self.app.blocked = true;

        self.service.getHelpForEdit(new HelpGetForEditQuery({ id: id }))
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.model = data;
                self.languageCombo = data.languageCombo;
                self.keyCombo = data.keyCombo;

                setTimeout(() => {
                    if (self.model.language) {
                        self.f.language.setValue(self.model.language.toString());
                    }

                    self.f.key.setValue(self.model.key);

                    if (id) {
                        self.f.displayName.setValue(data.displayName);
                        self.f.isActive.setValue(data.isActive);
                        self.f.body.setValue(self.model.body);
                        // self.quillEditor.root.innerHTML = self.model.body.replace(/\n/g, "");
                    }
                }, 0);
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
            const updateCmd = new HelpUpdateCommand();

            updateCmd.id = self.model.id;
            updateCmd.language = self.f.language.value;
            updateCmd.key = self.f.key.value;
            updateCmd.displayName = self.f.displayName.value;
            updateCmd.isActive = self.f.isActive.value;
            updateCmd.body = self.f.body.value;

            self.app.blocked = true;

            self.service.updateHelp(updateCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Helps.Help.SuccessfulUpdate'), self.l('Success'));
                    self.return();
                });
        } else {
            const createCmd = new HelpCreateCommand();

            createCmd.language = self.f.language.value;
            createCmd.key = self.f.key.value;
            createCmd.displayName = self.f.displayName.value;
            createCmd.isActive = self.f.isActive.value;
            createCmd.body = self.f.body.value;

            self.app.blocked = true;

            self.service.createHelp(createCmd)
                .pipe(finalize(() => {
                    self.app.blocked = false;
                }))
                .subscribe(data => {
                    self.notify.success(self.l('Helps.Help.SuccessfulCreate'), self.l('Success'));
                    self.activaModoNuevo();
                });
        }
    }

    activaModoNuevo(): void {
        const self = this;

        self.prepareForm();

        // focus
    }

    showChangeHistory(): void {
        const self = this;

        self.changeLogService.open('Help', self.id);
    }

    return(): void {
        this.router.navigate(['/app/admin/helps']);
    }
}
