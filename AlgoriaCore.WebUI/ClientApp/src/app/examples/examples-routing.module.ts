import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SampleChartsComponent } from './charts/samplecharts.component';
import { SampleChatLogComponent } from './chat/chatlog/samplechatlog.component';
import { SampleChatComponent } from './chat/samplechat.component';
import { SampleGoogleMapsComponent } from './googlemaps/samplegooglemaps.component';
import { SampleMultiselectComponent } from './multiselect/samplemultiselect.component';
import { SampleNumbersComponent } from './numbers/samplenumbers.component';
import { SamplePEditorComponent } from './peditor/samplepeditor.component';
import { SampleLogComponent } from './samplelog/samplelog.component';
import { EditSamplesDateDataComponent } from './samplesdatedata/editsamplesdatedata.component';
import { SamplesDateDataComponent } from './samplesdatedata/samplesdatedata.component';

const routes: Routes = [

    { path: 'samplesdatedata', component: SamplesDateDataComponent },
    { path: 'samplesdatedata/create', component: EditSamplesDateDataComponent },
    { path: 'samplesdatedata/edit/:id', component: EditSamplesDateDataComponent },
    { path: 'samplechat', component: SampleChatComponent },
    { path: 'samplechat/chatlog', component: SampleChatLogComponent },
    { path: 'samplelog', component: SampleLogComponent },
    { path: 'sampleNumbers', component: SampleNumbersComponent },
    { path: 'autocomplete', component: SampleMultiselectComponent },
    { path: 'googlemaps', component: SampleGoogleMapsComponent },
    { path: 'charts', component: SampleChartsComponent },
    { path: 'peditor', component: SamplePEditorComponent }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class ExamplesRoutingModule { }
