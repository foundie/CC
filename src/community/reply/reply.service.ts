import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class ReplyService {
  private db = admin.firestore();

  async createReply(email: string, commentId: string, text: string) {
    const commentSnapshot = await this.db
      .collection('comments')
      .doc(commentId)
      .get();
    if (!commentSnapshot.exists) {
      return {
        status: 'error',
        message: 'Comment not found',
      };
    }

    if (!text) {
      return {
        status: 'error',
        message: 'Reply text is required',
      };
    }

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

  async deleteReply(email: string, replyId: string) {
    const replySnapshot = await this.db
      .collection('replies')
      .doc(replyId)
      .get();
    const replyData = replySnapshot.data();

    if (!replySnapshot.exists) {
      return {
        status: 'error',
        message: 'Reply not found',
      };
    }

    if (replyData.email !== email) {
      return {
        status: 'error',
        message: 'You are not authorized to delete this reply',
      };
    }

    // Hapus balasan
    await replySnapshot.ref.delete();

    return {
      status: 'ok',
      message: 'Reply successfully deleted',
    };
  }
}
