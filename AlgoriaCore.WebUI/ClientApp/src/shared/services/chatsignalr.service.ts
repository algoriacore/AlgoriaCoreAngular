import { EventEmitter, Injectable, Output } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { AuthenticationService } from '../../app/_services/authentication.service';
import { AppConsts } from '../AppConsts';
import { NotifyService } from './notify.service';

@Injectable({ providedIn: 'root' })
export class ChatSignalrService {

    @Output() eventEmitterMessageReceived: EventEmitter<any> = new EventEmitter<any>();
    @Output() eventEmitterUserConnectionStateChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() eventEmitterFriendshipRequestReceived: EventEmitter<any> = new EventEmitter<any>();
    @Output() eventEmitterUserStateChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() eventEmitterAllUnreadMessagesOfUserRead: EventEmitter<any> = new EventEmitter<any>();

    connection: signalR.HubConnection;

    constructor(
        private authenticationService: AuthenticationService,
        private notify: NotifyService
    ) {
        this.createConnection();
        this.registerOnServerEvents();
    }

    init(): void {
        const self = this;
        // console.log('ChatSignalrService.init');
        self.connection.start()
            .then(function () {
                console.log('connection started');
                // self.connection.invoke('register');
                // console.log('connection registered');
            })
            .catch(err => console.log(err));
    }

    sendMessage(messageData, callback): void {
        const self = this;
        // console.log('ChatSignalrService.sendMessage');

        if (self.connection.state !== signalR.HubConnectionState.Connected) {
            if (callback) {
                callback();
            }

            self.notify.warning('Chat no está conectado.');
            return;
        }

        messageData.tenancyName = self.authenticationService.currentUserValue.tenancyName;
        messageData.userName = self.authenticationService.currentUserValue.userName;

        self.connection.invoke('sendMessage', messageData)
            .then(resp => {
                if (resp) {
                    self.notify.warning(resp);
                }
            })
            .catch(err => {
                self.notify.error(err.message);
            });

        if (callback) {
            callback();
        }
    }

    unregisterEventEmitters() {
        const self = this;

        self.eventEmitterMessageReceived.unsubscribe();
        self.eventEmitterUserConnectionStateChanged.unsubscribe();
        self.eventEmitterFriendshipRequestReceived.unsubscribe();
        self.eventEmitterUserStateChange.unsubscribe();
        self.eventEmitterAllUnreadMessagesOfUserRead.unsubscribe();

        self.eventEmitterMessageReceived = new EventEmitter<any>();
        self.eventEmitterUserConnectionStateChanged = new EventEmitter<any>();
        self.eventEmitterFriendshipRequestReceived = new EventEmitter<any>();
        self.eventEmitterUserStateChange = new EventEmitter<any>();
        self.eventEmitterAllUnreadMessagesOfUserRead = new EventEmitter<any>();
    }

    private createConnection(): void {
        const self = this;

        // console.log('ChatSignalrService.createConnection');
        // self.connection = new signalR.HubConnectionBuilder().withUrl('http://localhost:59686/signalr',
        // { accessTokenFactory: () => self.authenticationService.currentUserValue.token }).build(); // servidor local
        self.connection = new signalR.HubConnectionBuilder().withUrl(AppConsts.remoteServiceBaseUrl
            + '/signalr', { accessTokenFactory: () => self.authenticationService.currentUserValue.token }).build();
    }

    private registerOnServerEvents() {
        const self = this;

        // console.log('ChatSignalrService.registerOnServerEvents');

        self.connection.on('getChatMessage', (message) => {
            // console.log('self.connection.on.getChatMessage');
            // console.log(message);
            if (self.eventEmitterMessageReceived !== null) {
                self.eventEmitterMessageReceived.emit(message);
            }
        });

        self.connection.on('getUserConnectNotification', (user, isConnected) => {
            // console.log('self.connection.on.getUserConnectNotification');
            // console.log(user);
            // console.log(isConnected);
            if (self.eventEmitterUserConnectionStateChanged !== null) {
                self.eventEmitterUserConnectionStateChanged.emit({ user: user, isConnected: isConnected});
            }
        });

        self.connection.on('getFriendshipRequest', (friendship, isOwnRequest) => {
            // console.log('self.connection.on.getFriendshipRequest');
            // console.log(friendship);
            // console.log(isOwnRequest);
            if (self.eventEmitterFriendshipRequestReceived !== null) {
                // self.notify.info(self.l('Friendship.UserSendYouAFriendshipRequest', obj.friendship.friendNickname));
                self.eventEmitterFriendshipRequestReceived.emit({ friendship: friendship, isOwnRequest: isOwnRequest });
            }
        });

        self.connection.on('getUserStateChange', (user, newState) => {
            // console.log('self.connection.on.getUserStateChange');
            // console.log(user);
            // console.log(newState);
            if (self.eventEmitterUserStateChange !== null) {
                self.eventEmitterUserStateChange.emit({ user: user, newState: newState });
            }
        });

        self.connection.on('getAllUnreadMessagesOfUserRead', (user) => {
            // console.log('self.connection.on.getAllUnreadMessagesOfUserRead');
            // console.log(user);
            if (self.eventEmitterAllUnreadMessagesOfUserRead !== null) {
                self.eventEmitterAllUnreadMessagesOfUserRead.emit(user);
            }
        });
    }
}
