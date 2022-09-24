import { Injectable } from '@angular/core';
import { TemplateResponse } from '../service-proxies/service-proxies';

@Injectable({ providedIn: 'root' })
export class ProcessesService {
    private _templates: TemplateResponse[];

    get templates(): TemplateResponse[] {
        return this._templates;
    }

    set templates(templates) {
        this._templates = templates;
    }
}
