// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import * as admin from 'firebase-admin';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('WebSocket Server is initialized'); // Tambahkan ini

    const db = admin.firestore();
    const conversationsRef = db.collection('conversations');

    // Mendengarkan perubahan pada koleksi 'conversations'
    conversationsRef.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          // Mengirimkan pesan ke semua klien setiap kali ada percakapan baru atau diperbarui
          this.server.emit('message', change.doc.data());
        }
      });
    });
  }
}
