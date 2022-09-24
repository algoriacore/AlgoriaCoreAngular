import { Injectable } from '@angular/core';
import { CatalogCustomResponse } from '../service-proxies/service-proxies';

@Injectable({ providedIn: 'root' })
export class CatalogsCustomService {
    private _catalogs: CatalogCustomResponse[];

    get catalogs(): CatalogCustomResponse[] {
        return this._catalogs;
    }

    set catalogs(catalogs) {
        this._catalogs = catalogs;
    }
}
