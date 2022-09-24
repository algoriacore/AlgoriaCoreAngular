import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenChatRoomsComponent } from './openchatrooms.component';

const routes: Routes = [

    { path: 'open/:id', component: OpenChatRoomsComponent },
];

@NgModule({
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes)]
})
export class ChatRoomsRoutingModule { }
