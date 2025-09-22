import { Component, Injector } from '@angular/core';
import { AppComponentBase } from './app-component-base';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
    standalone: false
})
export class AppFooterComponent extends AppComponentBase {
    constructor(injector: Injector) {
        super(injector);
    }
}
