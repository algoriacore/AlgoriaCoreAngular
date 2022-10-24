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

        self.connection.start()
            .then(function () {
                console.log('connection started');
            })
            .catch(err => console.log(err));
    }

    sendMessage(messageData, callback): void {
        const self = this;

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

        self.connection = new signalR.HubConnectionBuilder().withUrl(AppConsts.remoteServiceBaseUrl
            + '/signalr', { accessTokenFactory: () => self.authenticationService.currentUserValue.token }).build();
    }

    private registerOnServerEvents() {
        const self = this;

        self.connection.on('getChatMessage', (message) => {
            if (self.eventEmitterMessageReceived !== null) {
                self.eventEmitterMessageReceived.emit(message);
            }
        });

        self.connection.on('getUserConnectNotification', (user, isConnected) => {
            if (self.eventEmitterUserConnectionStateChanged !== null) {
                self.eventEmitterUserConnectionStateChanged.emit({ user: user, isConnected: isConnected});
            }
        });

        self.connection.on('getFriendshipRequest', (friendship, isOwnRequest) => {
            if (self.eventEmitterFriendshipRequestReceived !== null) {
                self.eventEmitterFriendshipRequestReceived.emit({ friendship: friendship, isOwnRequest: isOwnRequest });
            }
        });

        self.connection.on('getUserStateChange', (user, newState) => {
            if (self.eventEmitterUserStateChange !== null) {
                self.eventEmitterUserStateChange.emit({ user: user, newState: newState });
            }
        });

        self.connection.on('getAllUnreadMessagesOfUserRead', (user) => {

            if (self.eventEmitterAllUnreadMessagesOfUserRead !== null) {
                self.eventEmitterAllUnreadMessagesOfUserRead.emit(user);
            }
        });
    }
}
