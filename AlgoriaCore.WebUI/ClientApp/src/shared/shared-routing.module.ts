import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

    // { path: 'samplesdatedata', component: SamplesDateDataComponent },
    // { path: 'samplesdatedata/create', component: EditSamplesDateDataComponent },
    // { path: 'samplesdatedata/edit/:id', component: EditSamplesDateDataComponent }
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class SharedRoutingModule { }
