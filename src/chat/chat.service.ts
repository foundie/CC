import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatService {
  async sendMessage(from: string, to: string, message: string): Promise<any> {
    const db = admin.firestore();

    // Gunakan email pengguna sebagai ID dokumen
    const docId = [from, to].sort().join('-');
    const docRef = db.collection('conversations').doc(docId);

    // Buat timestamp sebelum memasukkannya ke array
    const timestamp = new Date();

    const chat = {
      from,
      to,
      message,
      timestamp,
    };

    // Tambahkan pesan ke array 'messages' di dalam dokumen percakapan
    await docRef.set(
      {
        messages: admin.firestore.FieldValue.arrayUnion(chat),
      },
      { merge: true },
    );

    return {
      status: HttpStatus.CREATED,
      message: 'chat send successfully',
      chat,
      error: false,
    };
  }

  async getChat(id: string): Promise<any> {
    const db = admin.firestore();

    // Dapatkan referensi ke dokumen percakapan
    const conversationRef = db.collection('conversations').doc(id);

    // Dapatkan percakapan
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Conversation does not exist',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      status: HttpStatus.OK,
      message: 'Biodata fetched successfully',
      user: conversationDoc.data(),
    };
  }
}
