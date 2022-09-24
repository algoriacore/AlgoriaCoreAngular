import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SamplesDateDataComponent } from './samplesdatedata/samplesdatedata.component';
import { EditSamplesDateDataComponent } from './samplesdatedata/editsamplesdatedata.component';
import { SampleChatComponent } from './chat/samplechat.component';
import { SampleLogComponent } from './samplelog/samplelog.component';
import { SampleNumbersComponent } from './numbers/samplenumbers.component';
import { SampleMultiselectComponent } from './multiselect/samplemultiselect.component';
import { SampleChartsComponent } from './charts/samplecharts.component';
import { SampleArrobarComponent } from './ckeditor/samplearrobar.component';
import { SampleChatLogComponent } from './chat/chatlog/samplechatlog.component';

const routes: Routes = [

    { path: 'samplesdatedata', component: SamplesDateDataComponent },
    { path: 'samplesdatedata/create', component: EditSamplesDateDataComponent },
    { path: 'samplesdatedata/edit/:id', component: EditSamplesDateDataComponent },
    { path: 'samplechat', component: SampleChatComponent },
    { path: 'samplechat/chatlog', component: SampleChatLogComponent },
    { path: 'samplelog', component: SampleLogComponent },
    { path: 'sampleNumbers', component: SampleNumbersComponent },
    { path: 'autocomplete', component: SampleMultiselectComponent },
    { path: 'charts', component: SampleChartsComponent },
    { path: 'arrobar', component: SampleArrobarComponent }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class ExamplesRoutingModule { }
