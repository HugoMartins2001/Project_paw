import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ChatSocketService } from '../services/chat-socket.service';
import { DatePipe, NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManagerService } from '../services/manager.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConversationService } from '../services/conversation.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, DatePipe, FormsModule, HttpClientModule],
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
  isTyping = false;
  typingTimeout: any;
  restaurants: any[] = [];
  selectedRestaurantId: string = '';
  userRole = '';

  constructor(private chatSocket: ChatSocketService, private http: HttpClient) {}

  private managerService = inject(ManagerService);
  private conversationService = inject(ConversationService);

  onTyping() {
    this.chatSocket.sendTyping(this.conversationId);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 2000);
  }

  filterManagersByRestaurant() {
    if (!this.selectedRestaurantId) {
      // Mostrar todos os managers
      this.managerService.getManagers().subscribe(managers => {
        this.managers = managers;
      });
    } else {
      // Filtrar managers por restaurante (assumindo que cada manager tem um campo restaurantId)
      this.managerService.getManagers().subscribe(managers => {
        this.managers = managers.filter((m: any) => m.restaurantId === this.selectedRestaurantId);
      });
    }
  }

  // Separar conversas por utilizador (apenas mostrar conversas do utilizador autenticado)
  ngOnInit() {
    // Buscar managers reais
    this.managerService.getManagers().subscribe(managers => {
      this.managers = managers;
    });
    // Obter o ID do utilizador autenticado (exemplo: do localStorage)
    this.userId = localStorage.getItem('userId') || '';
    this.userRole = localStorage.getItem('role') || '';
    if (this.userRole === 'Admin') {
      this.chatSocket.joinAdminRoom();
      // Carregar TODAS as conversas para admin
      this.conversationService.getUserConversations().subscribe(convs => {
        this.conversations = convs; // Admin vê todas as conversas
      });
    } else if (this.userId) {
      this.chatSocket.joinUserRoom(this.userId);
      // Load user conversations (history)
      this.conversationService.getUserConversations().subscribe(convs => {
        // Só mostrar conversas onde o utilizador está incluído
        this.conversations = convs.filter(conv => conv.participants.some((p: any) => p._id === this.userId));
      });
      // Mensagem automática de boas-vindas
      if (this.showPopup && this.messages.length === 0) {
        this.messages.push({
          text: 'Welcome! How can we help you today?',
          senderName: 'Support',
          createdAt: new Date(),
          senderProfilePic: null
        });
      }
    }
    // Subscrição única para notificações e mensagens recebidas
    this.chatSocket.onNewMessageNotification().subscribe((conversationId: string) => {
      console.log('[Socket] newMessageNotification received:', conversationId, 'UserRole:', this.userRole); // DEBUG
      // Só mostrar badge se não estiver com a conversa aberta
      if (!this.showPopup || this.conversationId !== conversationId) {
        this.badgeCount++;
      }
      // Atualizar lista de conversas para admin ver novas conversas imediatamente
      if (this.userRole === 'Admin') {
        this.conversationService.getUserConversations().subscribe(convs => {
          this.conversations = convs;
          console.log('[Admin] Updated conversations:', this.conversations); // DEBUG
          // Forçar atualização da UI
          if (window && window.dispatchEvent) {
            window.dispatchEvent(new Event('resize'));
          }
        });
      }
    });
    this.chatSocket.onTyping().subscribe(() => {
      this.isTyping = true;
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
      }, 2000);
    });
    this.receiveMessageSubscription = this.chatSocket.onReceiveMessage().subscribe(msg => {
      console.log('[Socket] receiveMessage received:', msg); // DEBUG
      // Só adicionar se não for duplicado
      if (!this.messages.length || this.messages[this.messages.length - 1]._id !== msg._id) {
        this.messages.push({
          ...msg,
          senderName: msg.sender?.name || msg.sender?.email || 'User',
          senderProfilePic: msg.sender?.profilePic || null
        });
      }
      // Atualizar lastMessage na conversa para refletir a última mensagem
      const conv = this.conversations.find(c => c._id === msg.conversation);
      if (conv) {
        conv.lastMessage = msg;
      }
    });
    // Buscar restaurantes (exemplo, pode ser adaptado ao teu backend)
    this.http.get<any[]>('http://localhost:3000/api/restaurants').subscribe(rests => {
      this.restaurants = rests;
    });
    // Preferência de tema
    const saved = localStorage.getItem('chatDarkMode');
    if (saved !== null) {
      this._isDarkMode = saved === '1';
    } else {
      this._isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.documentElement.setAttribute('data-chat-dark', this._isDarkMode ? '1' : '0');
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

  async selectRecipient(type: 'admin' | 'manager', managerId?: string) {
    this.recipientType = type;
    let conversationObs;
    if (type === 'admin') {
      const adminId = await this.getAdminId();
      const participantIds = [this.userId, adminId];
      conversationObs = this.conversationService.startConversation(participantIds, 'client-admin');
    } else if (type === 'manager' && managerId) {
      this.selectedManagerId = managerId;
      const participantIds = [this.userId, managerId];
      conversationObs = this.conversationService.startConversation(participantIds, 'client-manager');
    } else {
      return;
    }
    // Cancelar subscrição anterior para evitar mensagens duplicadas
    if (this.receiveMessageSubscription) {
      this.receiveMessageSubscription.unsubscribe();
      this.receiveMessageSubscription = null;
    }
    conversationObs.subscribe(conv => {
      if (!conv || !conv._id) return;
      this.conversationId = conv._id;
      this.chatSocket.joinConversation(this.conversationId);
      // Adiciona a conversa à lista se ainda não existir
      if (!this.conversations.some(c => c._id === conv._id)) {
        this.conversations.push(conv);
      }
      this.loadMessages(this.conversationId);
      // Subscrição única para mensagens recebidas
      this.receiveMessageSubscription = this.chatSocket.onReceiveMessage().subscribe(msg => {
        console.log('[Socket] receiveMessage (selectRecipient) received:', msg); // DEBUG
        if (!this.messages.length || this.messages[this.messages.length - 1]._id !== msg._id) {
          this.messages.push({
            ...msg,
            senderName: msg.sender?.name || msg.sender?.email || 'User',
            senderProfilePic: msg.sender?.profilePic || null
          });
        }
        // Atualizar lastMessage na conversa para refletir a última mensagem
        const convIdx = this.conversations.findIndex(c => c._id === msg.conversation);
        if (convIdx !== -1) {
          this.conversations[convIdx].lastMessage = msg;
        }
      });
    });
  }

  // Helper para obter o ID do admin (pode ser melhorado para multi-admin)
  async getAdminId(): Promise<string> {
    // Busca o primeiro admin real do backend
    const res = await this.http.get<any[]>('http://localhost:3000/api/users/admins').toPromise();
    if (res && res.length > 0) {
      return res[0]._id;
    }
    throw new Error('No admin found');
  }

  // Helper para mostrar nomes dos participantes (exceto o próprio user/admin)
  getOtherParticipants(conv: any): string {
    return conv.participants
      .filter((p: any) => p._id !== this.userId)
      .map((p: any) => p.name || p.email)
      .join(', ');
  }

  loadMessages(conversationId: string) {
    if (!conversationId) return; // Prevent API call with undefined
    this.conversationService.getMessages(conversationId).subscribe(msgs => {
      this.messages = msgs.map(msg => ({
        ...msg,
        senderName: msg.sender?.name || msg.sender?.email || 'User',
        senderProfilePic: msg.sender?.profilePic || null
      }));
    });
  }

  sendMessage() {
    if (this.messageText.trim()) {
      let recipientId = '';
      const conv = this.conversations.find(conv => conv._id === this.conversationId);
      if (conv) {
        const other = conv.participants.find((p: any) => p._id !== this.userId);
        if (other) recipientId = other._id;
      }
      if (!recipientId && this.recipientType === 'manager') {
        recipientId = this.selectedManagerId;
      }
      const msg = {
        text: this.messageText,
        sender: this.userId,
        recipientId,
        createdAt: new Date()
      };
      // Otimista: adicionar já à lista
      this.messages.push({
        ...msg,
        senderName: 'You',
        senderProfilePic: null
      });
      this.chatSocket.sendMessage(this.conversationId, msg);
      this.messageText = '';
    }
  }

  openConversation(conversation: any) {
    this.selectedConversation = conversation;
    this.conversationId = conversation._id;
    this.chatSocket.joinConversation(this.conversationId); // Garante que admin entra na sala
    this.conversationService.getMessages(conversation._id).subscribe(msgs => {
      this.messages = msgs.map(msg => ({
        ...msg,
        senderName: msg.sender?.name || msg.sender?.email || 'User',
        senderProfilePic: msg.sender?.profilePic || null
      }));
    });
    this.recipientType = null; // Hide recipient selection
    this.showPopup = true;
    this.badgeCount = 0;
  }

  // Avaliação do atendimento
  rating: number = 0;
  showRating = false;
  submitRating() {
    this.showRating = false;
    // Aqui pode-se enviar o rating para o backend se necessário
    this.messages.push({
      text: `Thank you for your feedback! You rated this chat ${this.rating}/5.`,
      senderName: 'Support',
      createdAt: new Date(),
      senderProfilePic: null
    });
  }

  // Modo escuro/claro automático + manual
  private _isDarkMode: boolean = false;
  get isDarkMode() {
    return this._isDarkMode;
  }
  set isDarkMode(val: boolean) {
    this._isDarkMode = val;
    localStorage.setItem('chatDarkMode', val ? '1' : '0');
    document.documentElement.setAttribute('data-chat-dark', val ? '1' : '0');
  }
  showPreferences = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  openPreferences() {
    this.showPreferences = true;
  }
  closePreferences() {
    this.showPreferences = false;
  }

  ngOnDestroy() {
    if (this.receiveMessageSubscription) {
      this.receiveMessageSubscription.unsubscribe();
      this.receiveMessageSubscription = null;
    }
    this.chatSocket.disconnect();
  }
}
