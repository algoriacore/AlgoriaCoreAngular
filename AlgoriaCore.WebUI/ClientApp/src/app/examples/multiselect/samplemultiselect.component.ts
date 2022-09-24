import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'moment-duration-format';
import 'moment-timezone';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import { UserListResponse, UserServiceProxy } from 'src/shared/service-proxies/service-proxies';
import { AppComponent } from '../../app.component';

@Component({
    templateUrl: './samplemultiselect.component.html'
})
export class SampleMultiselectComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    lista: UserListResponse[];

    fieldLabels: any = {};

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

        self.lista = [];
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
            simpleValue: [''],
            itemTemplateValue: [''],
            multiple: [[]], // Es un array de objetos
            selectedValue: [[]] // Es un array de objetos
        });
    }

    search(event): void {
        const self = this;

        self.app.blocked = true;

        self.userService.getUserAutocompleteList(event.query)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.lista = data;
            });
    }

    checkSelect(event, item): void {
        const self = this;

        const ch = event.srcElement.checked;

        if (ch) {
            self.f.selectedValue.value.push(item);
        } else {
            const ix = self.f.selectedValue.value.findIndex(m => m.id === item.id);
            if (ix >= 0) {
                self.f.selectedValue.value.splice(ix, 1);
            }
        }

        event.stopPropagation();
    }

    verifyCheck(item): boolean {
        const self = this;

        const ix = self.f.selectedValue.value.findIndex(m => m.id === item.id);
        return ix >= 0;
    }

    verify(): void {
        const self = this;
        console.log(self.f.selectedValue.value);
    }
}
