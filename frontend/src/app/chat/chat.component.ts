import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ChatSocketService } from '../services/chat-socket.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../services/manager.service';
import { HttpClientModule } from '@angular/common/http';
import { ConversationService } from '../services/conversation.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, FormsModule, HttpClientModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [DatePipe]
})
export class ChatComponent implements OnInit, OnDestroy {
  conversationId = '';
  messageText = '';
  messages: any[] = [];
  showPopup = false;
  recipientType: 'admin' | 'manager' | null = null;
  managers: any[] = [];
  selectedManagerId: string = '';
  receiveMessageSubscription: any;
  badgeCount = 0;
  userId = '';
  conversations: any[] = [];
  selectedConversation: any = null;

  constructor(private chatSocket: ChatSocketService) {}

  private managerService = inject(ManagerService);
  private conversationService = inject(ConversationService);

  ngOnInit() {
    // Buscar managers reais
    this.managerService.getManagers().subscribe(managers => {
      this.managers = managers;
    });
    // Obter o ID do utilizador autenticado (exemplo: do localStorage)
    this.userId = localStorage.getItem('userId') || '';
    if (this.userId) {
      this.chatSocket.joinUserRoom(this.userId);
      this.chatSocket.onNewMessageNotification().subscribe(() => {
        this.badgeCount++;
      });
      // Load user conversations (history)
      this.conversationService.getUserConversations().subscribe(convs => {
        this.conversations = convs;
      });
    }
  }

  openPopup() {
    this.showPopup = true;
    this.badgeCount = 0; // Limpa badge ao abrir o chat
    // Carregar histórico de conversas e mensagens aqui se necessário
  }
  closePopup() {
    this.showPopup = false;
    this.messages = [];
    this.recipientType = null;
    this.selectedManagerId = '';
  }

  selectRecipient(type: 'admin' | 'manager', managerId?: string) {
    this.recipientType = type;
    if (type === 'admin') {
      this.conversationId = 'admin-conversation';
      this.chatSocket.joinConversation(this.conversationId);
    } else if (type === 'manager' && managerId) {
      this.selectedManagerId = managerId;
      this.conversationId = `manager-${managerId}`;
      this.chatSocket.joinConversation(this.conversationId);
    }
    if (this.receiveMessageSubscription) {
      this.receiveMessageSubscription.unsubscribe();
    }
    this.receiveMessageSubscription = this.chatSocket.onReceiveMessage().subscribe(msg => {
      this.messages.push(msg);
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      const msg = {
        text: this.messageText,
        sender: 'me', // Replace with real user
        createdAt: new Date()
      };
      this.chatSocket.sendMessage(this.conversationId, msg);
      this.messageText = '';
    }
  }

  openConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.conversationService.getMessages(conversation._id).subscribe(msgs => {
      this.messages = msgs;
    });
    this.recipientType = null; // Hide recipient selection
    this.showPopup = true;
    this.badgeCount = 0;
  }

  ngOnDestroy() {
    if (this.receiveMessageSubscription) {
      this.receiveMessageSubscription.unsubscribe();
    }
    this.chatSocket.disconnect();
  }
}
