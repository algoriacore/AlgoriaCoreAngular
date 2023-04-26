import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import 'moment-duration-format';
import 'moment-timezone';
import { AppComponentBase } from 'src/app/app-component-base';

@Component({
    templateUrl: './samplegooglemaps.component.html'
})
export class SampleGoogleMapsComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

    fieldLabels: any = {};

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder
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
    }

    prepareForm() {
        const self = this;

        self.fieldLabels = {
            googleAddress: this.l('Examples.GoggleMaps.GoogleAddress')
        };

        self.form = self.formBuilder.group({
            googleAddress: [null]
        });
    }
}
