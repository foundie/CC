import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ReplyService {
  private db = admin.firestore();

  async createReply(email: string, commentId: string, text: string) {
    const replyRef = this.db.collection('replies').doc();
    const replyData = {
      replyId: replyRef.id,
      email,
      commentId,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await replyRef.set(replyData);

    return {
      status: 'ok',
      message: 'Reply successfully created',
      data: replyData,
    };
  }
}
