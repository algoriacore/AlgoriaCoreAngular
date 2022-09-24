import { Component, Injector, OnInit } from '@angular/core';
import { AppComponentBase } from '../../app-component-base';

@Component({
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends AppComponentBase implements OnInit {

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() {
        const self = this;
    }
}
