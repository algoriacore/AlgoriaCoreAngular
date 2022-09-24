import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { UserServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplearrobar.component.html'
})
export class SampleArrobarComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    fieldLabels: any = {};

    toolbar: any;
    heading: any;
    config: any;
    content: any;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private userService: UserServiceProxy,
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

        self.prepareForm();
        self.configEditor();
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            simple: this.l('Examples.Autocomplete.Simple'),
            itemTemplate: this.l('Examples.Autocomplete.Itemtemplate'),
            multiple: this.l('Examples.Autocomplete.Multiple'),
            multipleWithChecks: this.l('Examples.Autocomplete.MultipleWithChecks'),
        };

        self.form = self.formBuilder.group({
            editorValue: [''],
            itemTemplateValue: [''],
            multiple: [[]],
            selectedValue: [[]]
        });
    }

    verify(): void {
        const self = this;

        console.log(self.f.editorValue.value);
    }

    search(opts: any, callback: any): void {
        const self = this;

        self.app.blocked = true;

        self.userService.getUserAutocompleteList(opts.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                callback(data);
            });
    }

    configEditor(): void {
        const self = this;

        const search = (opts, callback) => {
            self.userService.getUserForEditorAutocompleteList(opts.query)
                .pipe(finalize(() => { }))
                .subscribe(data => {
                    callback(data);
                });
        };

        self.config = {
            extraPlugins: 'mentions,autocomplete',
            mentions: [{
                feed: search,
                itemTemplate: '<li data-id="{id}">' +
                    '<div class="username">{login}</div>' +
                    '<div class="fullname">{fullName}</div>' +
                    '</li>',
                outputTemplate: '<a href="">@{login}</a><span>&nbsp;</span>',
                minChars: 1
            }]
        };
    }
}
