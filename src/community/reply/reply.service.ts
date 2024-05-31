import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Comment not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!text) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Reply text is required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
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
      status: HttpStatus.CREATED,
      message: 'Reply successfully created',
      data: replyData,
      error: false,
    };
  }

  async deleteReply(email: string, replyId: string) {
    const replySnapshot = await this.db
      .collection('replies')
      .doc(replyId)
      .get();
    const replyData = replySnapshot.data();

    if (!replySnapshot.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Reply not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (replyData.email !== email) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You are not authorized to delete this reply',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Hapus balasan
    await replySnapshot.ref.delete();

    return {
      status: HttpStatus.OK,
      message: 'Reply successfully deleted',
      error: false,
    };
  }
}
