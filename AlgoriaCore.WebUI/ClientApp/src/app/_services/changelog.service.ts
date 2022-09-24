import { Injectable } from '@angular/core';
import { DialogCustomService } from '../../shared/services/dialog.custom.service';
import { LocalizationService } from '../../shared/services/localization.service';
import { ChangeLogComponent } from '../_components/changelog.component';

@Injectable({ providedIn: 'root' })
export class ChangeLogService {

    constructor(private localization: LocalizationService, private dialogService: DialogCustomService) { }

    open(table: string, key: any): any {
        const self = this;

        self.dialogService.open(ChangeLogComponent, {
            styleClass: 'd-xl-70 d-lg-70 d-md-75 d-sm',
            showHeader: true,
            header: self.localization.l('ChangeLogs.ChangeLog.Consult'),
            dismissableMask: false,
            data: {
                table: table,
                key: key.toString()
            }
        });
    }
}
