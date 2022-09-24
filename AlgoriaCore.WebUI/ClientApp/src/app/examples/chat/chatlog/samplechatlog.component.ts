import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from 'src/app/app-component-base';

@Component({
    templateUrl: './samplechatlog.component.html'
})
export class SampleChatLogComponent extends AppComponentBase implements OnInit {

    form: FormGroup;

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

        self.form = self.formBuilder.group({});
    }
}
