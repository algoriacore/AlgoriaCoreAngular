import { NgModule } from '@angular/core';

import { MomentFormatPipe } from './moment-format.pipe';

@NgModule({
    providers: [],
    declarations: [
        MomentFormatPipe
    ],
    exports: [
        MomentFormatPipe
    ]
})
export class UtilsModule { }
