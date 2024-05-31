import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class CommentService {
  private db = admin.firestore();

  async createComment(email: string, postId: string, text: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    if (!postSnapshot.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Post not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!text) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Comment text is required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
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
      status: HttpStatus.CREATED,
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
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Comment not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (commentData.email !== email) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You are not authorized to delete this comment',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
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
      status: HttpStatus.OK,
      message: 'Comment and related replies successfully deleted',
      error: false,
    };
  }
}
