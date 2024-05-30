import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class CommentService {
  private db = admin.firestore();

  async createComment(email: string, postId: string, text: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    if (!postSnapshot.exists) {
      return {
        status: 'error',
        message: 'Post not found',
        error: true,
      };
    }

    if (!text) {
      return {
        status: 'error',
        message: 'Comment text is required',
        error: true,
      };
    }

    const commentRef = this.db.collection('comments').doc();
    const commentData = {
      commentId: commentRef.id,
      email,
      postId,
      text,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await commentRef.set(commentData);

    const doc = await commentRef.get();
    const dataWithTimestamp = doc.data();

    return {
      status: 'ok',
      message: 'Comment successfully created',
      data: {
        ...dataWithTimestamp,
      },
      error: false,
    };
  }

  async deleteComment(email: string, commentId: string) {
    const commentSnapshot = await this.db
      .collection('comments')
      .doc(commentId)
      .get();
    const commentData = commentSnapshot.data();

    if (!commentSnapshot.exists) {
      return {
        status: 'error',
        message: 'Comment not found',
        error: true,
      };
    }

    if (commentData.email !== email) {
      return {
        status: 'error',
        message: 'You are not authorized to delete this comment',
        error: true,
      };
    }

    // Hapus balasan
    const repliesQuerySnapshot = await this.db
      .collection('replies')
      .where('commentId', '==', commentId)
      .get();
    const batch = this.db.batch();
    repliesQuerySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Hapus komentar
    batch.delete(commentSnapshot.ref);

    // Jalankan batch
    await batch.commit();
    return {
      status: 'ok',
      message: 'Comment and related replies successfully deleted',
      error: false,
    };
  }
}
