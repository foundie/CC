import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class CommentService {
  private db = admin.firestore();

  async createComment(email: string, postId: string, text: string) {
    const commentRef = this.db.collection('comments').doc();
    const commentData = {
      commentId: commentRef.id,
      email,
      postId,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await commentRef.set(commentData);

    // Get the document with the filled timestamp
    const doc = await commentRef.get();
    const dataWithTimestamp = doc.data();

    return {
      status: 'ok',
      message: 'Comment successfully created',
      data: {
        ...dataWithTimestamp,
      },
    };
  }
}
