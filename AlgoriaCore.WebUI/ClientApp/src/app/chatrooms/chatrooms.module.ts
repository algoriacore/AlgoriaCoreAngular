import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BlockUIModule } from 'primeng/blockui';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { DialogCustomService } from 'src/shared/services/dialog.custom.service';
import { SharedModule } from '../../shared/shared.module';
import { ChatRoomsRoutingModule } from './chatrooms-routing.module';
import { OpenChatRoomsComponent } from './openchatrooms.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BlockUIModule,
        MenuModule,
        SharedModule,

        ChatRoomsRoutingModule
    ],
    declarations: [
        OpenChatRoomsComponent
    ],
    providers: [
        DialogService,
        DialogCustomService
    ]
})
export class ChatRoomsModule { }
