import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { VirtualScroller } from 'primeng/virtualscroller';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from 'src/app/app-component-base';
import {
    AuditLogListResponse,
    ChatMessageGetListQuery,
    ChatMessageMarkReadCommand,
    ChatMessageReadState,
    ChatMessageServiceProxy,
    ChatSide,
    FriendshipCreateCommand,
    FriendshipGetListQuery,
    FriendshipServiceProxy,
    FriendshipState,
    UserListResponse
} from '../../../shared/service-proxies/service-proxies';
import { ChatSignalrService } from '../../../shared/services/chatsignalr.service';
import { AppComponent } from '../../app.component';
import { AuthenticationService } from '../../_services/authentication.service';
import { ChatFriendDto } from './ChatFriendDto';
import { SampleChatFindUsersComponent } from './samplechat.findusers.component';

@Component({
    templateUrl: './samplechat.component.html'
})
export class SampleChatComponent extends AppComponentBase implements OnInit {

    @ViewChild('virtualScroller', { static: false }) virtualScroller: VirtualScroller;
    @ViewChild('menu', { static: false }) btnMenu: Menu;

    form: FormGroup;
    // formBusqueda: FormGroup;

    menuItems: MenuItem[];

    loading = false;
    saving = false;
    sendingMessage = false;
    // urlPictureProfileFrom: string;

    totalLazyCarsLength = 0;
    lazyCars: any[] = [];

    userFriendship: ChatFriendDto[] = [];
    userNameFilter = '';
    friendshipState: typeof FriendshipState = FriendshipState;
    chatMessageReadState: typeof ChatMessageReadState = ChatMessageReadState;
    chatMessageSide: typeof ChatSide = ChatSide;
    selectedUser: ChatFriendDto = new ChatFriendDto();
    loadingPreviousUserMessages = false;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private router: Router,
        private chatSignalrService: ChatSignalrService,
        private authenticationService: AuthenticationService,
        private friendshipService: FriendshipServiceProxy,
        private chatMessageService: ChatMessageServiceProxy,
        private app: AppComponent
    ) {
        super(injector);
    }

    // convenience getter for easy access to form fields
    get f() {
        return this.form.controls;
    }

    ngOnInit() {
        const self = this;

        self.form = self.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(4096)]]
        });
        this.urlPictureProfile = this.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' +
            self.authenticationService.currentUserValue.userId + '&v' + (new Date().getTime());

        self.getFriendshipList();

        self.chatSignalrService.unregisterEventEmitters();

        self.chatSignalrService.eventEmitterMessageReceived.subscribe((message) => {
            console.log('onMessageReceived2');
            console.log(message);

            const user = self.getFriendOrNull(message.targetUserId, message.targetTenantId);

            if (!user) {
                return;
            }

            user.messages = user.messages || [];
            user.messages.push(message);

            const tmp = user.messages.slice(0, user.messages.length);

            user.messages = tmp;

            const isCurrentChatUser = self.selectedUser !== null && self.selectedUser.friendTenantId === user.friendTenantId &&
                self.selectedUser.friendUserId === user.friendUserId;

            if (message.side === self.chatMessageSide.Receiver) {
                user.unreadMessageCount += 1;
                message.readState = self.chatMessageReadState.Unread;

                if (isCurrentChatUser) {
                    self.markAllUnreadMessagesOfUserAsRead(user);
                } else {
                    self.notify.info(user.friendUserName + ': ' +
                        (message.message.length > 100 ? message.message.substring(0, 100) + '...' : message.message));
                    // abrir ventana de chat del usuario en especifico
                }
            }

            if (isCurrentChatUser) {
                self.scrollToBottom();
            }
        });

        self.chatSignalrService.eventEmitterUserConnectionStateChanged.subscribe((obj) => {
            console.log('onUserConnectionStateChanged2');

            const user = self.getFriendOrNull(obj.user.userId, obj.user.tenantId);

            if (!user) {
                return;
            }

            user.isOnline = obj.isConnected;
        });

        self.chatSignalrService.eventEmitterFriendshipRequestReceived.subscribe((obj) => {
            console.log('onFriendshipRequestReceived2');

            if (obj.isOwnRequest !== true) {
                self.notify.info(self.l('Friendship.UserSendYouAFriendshipRequest', obj.friendship.friendNickname));
                self.getFriendshipList();
            }
        });

        self.chatSignalrService.eventEmitterUserStateChange.subscribe((obj) => {
            console.log('onUserStateChange2');

            const user = self.getFriendOrNull(obj.user.userId, obj.user.tenantId);

            if (!user) {
                return;
            }

            user.state = obj.newState;
        });

        self.chatSignalrService.eventEmitterAllUnreadMessagesOfUserRead.subscribe((obj) => {
            console.log('onAllUnreadMessagesOfUserRead2');

            const user = self.getFriendOrNull(obj.userId, obj.tenantId);

            if (!user) {
                return;
            }

            user.unreadMessageCount = 0;
        });
    }

    getFriendshipList(): void {
        const self = this;

        self.app.blocked = true;

        self.friendshipService.getFriendshipList(new FriendshipGetListQuery())
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.userFriendship = (data.items as ChatFriendDto[]);

                for (const userFriendship of self.userFriendship) {
                    userFriendship.friendProfilePictureUrl = this.getBaseServiceUrl() + '/api/User/GetPictureProfile?id=' +
                        userFriendship.friendUserId + '&v' + (new Date().getTime());
                }
            });
    }

    sendMessage(): void {
        const self = this;

        /// / stop here if form is invalid
        if (self.form.invalid) {
            return;
        }

        console.log('sendMessage');

        const msg = {
            tenantId: self.selectedUser.friendTenantId,
            userId: self.selectedUser.friendUserId,
            message: self.f.message.value,
            profilePictureId: null
        };

        self.sendingMessage = true;
        self.chatSignalrService.sendMessage(msg, () => {
            self.f.message.setValue('');
            self.sendingMessage = false;
        });
    }

    search(): void {
        const self = this;

        const ref = self.dialogService.open(SampleChatFindUsersComponent, {
            width: '80%',
            showHeader: false,
            dismissableMask: false,
            data: new AuditLogListResponse(),
            header: self.l('Users'),
            contentStyle: { height: '600px', overflow: 'auto' }
        });

        ref.onClose.subscribe((user: UserListResponse = null) => {
            if (user) {
                self.addFriendSelected(user);
            }
        });

    }

    addFriendSelected(user: UserListResponse): void {
        const self = this;

        const cmd = new FriendshipCreateCommand();
        cmd.friendTenantId = self.authenticationService.currentUserValue.tenantId;
        cmd.friendUserId = user.id;

        self.app.blocked = true;

        self.friendshipService.createFriendship(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('Friendship.FriendshipRequestAccepted'), self.l('Success'));
                self.getFriendshipList();
            });
    }

    block(friend: ChatFriendDto): void {
        const self = this;

        const cmd = new FriendshipCreateCommand();
        cmd.friendTenantId = friend.friendTenantId;
        cmd.friendUserId = friend.friendUserId;

        self.app.blocked = true;
        self.friendshipService.blockFriendship(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('Friendship.UserBlocked'), self.l('Success'));
            });
    }

    unblock(friend: ChatFriendDto): void {
        const self = this;

        const cmd = new FriendshipCreateCommand();
        cmd.friendTenantId = friend.friendTenantId;
        cmd.friendUserId = friend.friendUserId;

        self.app.blocked = true;
        self.friendshipService.unblockFriendship(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                self.notify.success(self.l('Friendship.UserUnblocked'), self.l('Success'));
            });
    }

    markAllUnreadMessagesOfUserAsRead(friend: ChatFriendDto): void {
        const self = this;
        console.log('markAllUnreadMessagesOfUserAsRead');
        if (!friend) {
            return;
        }

        const unreadMessages = friend.messages.filter(m => m.readState === ChatMessageReadState.Unread);
        const unreadMessageIds = _.map(unreadMessages, 'id');

        if (!unreadMessageIds.length) {
            return;
        }

        const cmd = new ChatMessageMarkReadCommand();
        cmd.friendTenantId = friend.friendTenantId;
        cmd.friendUserId = friend.friendUserId;
        console.log('markAllUnreadMessagesOfUserAsRead sending');
        self.app.blocked = true;
        self.chatMessageService.markAllUnreadMessagesOfUserAsRead(cmd)
            .pipe(finalize(() => {
                self.app.blocked = false;
            }))
            .subscribe(data => {
                friend.messages.forEach(message => {
                    if (unreadMessageIds.indexOf(message.id) >= 0) {
                        message.readState = ChatMessageReadState.Read;
                    }
                });
                console.log('markAllUnreadMessagesOfUserAsRead finish');
            });
    }

    createAndShowMenu(event: any, friend: ChatFriendDto): void {
        const self = this;

        self.menuItems = self.createMenuItems(friend);

        self.btnMenu.toggle(event);
    }

    createMenuItems(rowData: ChatFriendDto): MenuItem[] {
        const self = this;

        const ll = [
            {
                label: self.l('Chat.BlockUser'),
                icon: 'pi pi-fw pi-ban',
                queryParams: rowData,
                command: (event) => {
                    self.block(event.item.queryParams);
                },
                visible: rowData.state === FriendshipState.Accepted
            },
            {
                label: self.l('Chat.UnblockUser'),
                icon: 'pi pi-fw pi-check',
                queryParams: rowData,
                command: (event) => {
                    self.unblock(event.item.queryParams);
                },
                visible: rowData.state === FriendshipState.Blocked
            },
            {
                label: self.l('Select'),
                icon: 'pi pi-fw pi-comment',
                queryParams: rowData,
                command: (event) => {
                    self.selectFriend(event.item.queryParams);
                }
            },
        ];

        return ll;
    }

    getFriendOrNull(userId: number, tenantId?: number): ChatFriendDto {
        const self = this;

        const ll = self.userFriendship.filter(m => m.friendTenantId === tenantId && m.friendUserId === userId);

        return ll.length === 1 ? ll[0] : null;
    }

    getFilteredFriends(state: FriendshipState, userNameFilter: string): ChatFriendDto[] {
        const self = this;

        const foundFriends = self.userFriendship.filter(friend => friend.state === state &&
            this.getShownUserName(friend.friendTenancyName, friend.friendUserName)
                .toLocaleLowerCase()
                .indexOf(userNameFilter.toLocaleLowerCase()) >= 0);

        return foundFriends;
    }

    getFilteredFriendsCount(state: FriendshipState): number {
        const self = this;

        return self.userFriendship.filter(friend => friend.state === state).length;
    }

    getShownUserName(tenanycName: string, userName: string): string {
        return (tenanycName ? tenanycName : '.') + '\\' + userName;
    }

    selectFriend(friend: ChatFriendDto): void {
        const self = this;

        self.selectedUser = self.getFriendOrNull(friend.friendUserId, friend.friendTenantId);

        if (!self.selectedUser) {
            return;
        }

        self.f.message.setValue('');

        if (!self.selectedUser.messagesLoaded) {
            self.loadMessages(self.selectedUser, () => {
                self.selectedUser.messagesLoaded = true;
                self.scrollToBottom();
            });
        } else {
            self.markAllUnreadMessagesOfUserAsRead(self.selectedUser);
            self.scrollToBottom();
        }
    }

    loadMessages(user: ChatFriendDto, callback: any): void {
        const self = this;

        self.loadingPreviousUserMessages = true;

        let minMessageId;
        if (user.messages && user.messages.length) {
            minMessageId = _.min(_.map(user.messages, m => m.id));
        }

        const query = new ChatMessageGetListQuery();
        query.tenantId = user.friendTenantId;
        query.userId = user.friendUserId;
        query.minMessageId = minMessageId;

        self.chatMessageService.getChatMessageList(query)
            .subscribe(result => {
                if (!user.messages) {
                    user.messages = [];
                }

                user.messages = result.items.concat(user.messages);
                self.markAllUnreadMessagesOfUserAsRead(user);

                if (!result.items.length) {
                    user.allPreviousMessagesLoaded = true;
                }

                self.loadingPreviousUserMessages = false;
                if (callback) {
                    callback();
                }
            });
    }

    scrollToBottom(): void {
        const self = this;

        if (self.selectedUser.id) {
            setTimeout(function () {
                self.virtualScroller.scrollToIndex(self.selectedUser.messages.length);
            }, 1000);
        }
    }
}
