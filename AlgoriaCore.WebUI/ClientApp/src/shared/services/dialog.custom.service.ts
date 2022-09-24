import { Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';

@Injectable({ providedIn: 'root' })
export class DialogCustomService {

    constructor(private dialogService: DialogService) {}

    open(component: any, parameters: any): any {
        const self = this;

        if (!parameters) {
            parameters = {};
        }

        if (!parameters.contentStyle) {
            parameters.contentStyle = {};
        }

        if (!parameters.contentStyle['max-height']) {
            const modalHeight = window.innerHeight - 30;

            parameters.contentStyle['max-height'] = modalHeight + 'px';
        }

        if (!parameters.contentStyle['overflow']) {
            parameters.contentStyle['overflow'] = 'auto';
        }

        return self.dialogService.open(component, parameters);
    }
}
