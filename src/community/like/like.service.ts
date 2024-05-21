import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class LikeService {
  private db = admin.firestore();

  async createLike(email: string, postId: string) {
    // Validasi jika postId tidak ada di database
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    if (!postSnapshot.exists) {
      return {
        status: 'error',
        message: 'Post not found',
      };
    }

    const likeSnapshot = await this.db
      .collection('likes')
      .where('email', '==', email)
      .where('postId', '==', postId)
      .get();
    if (!likeSnapshot.empty) {
      return {
        status: 'error',
        message: 'You have already liked this post',
      };
    }

    const likeRef = this.db.collection('likes').doc();
    const likeData = {
      email,
      postId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await likeRef.set(likeData);

    return {
      status: 'ok',
      message: 'Like successfully created',
      likeId: likeRef.id,
      data: likeData,
    };
  }

  async deleteLike(email: string, likeId: string) {
    const likeSnapshot = await this.db.collection('likes').doc(likeId).get();
    const likeData = likeSnapshot.data();

    if (!likeSnapshot.exists) {
      return {
        status: 'error',
        message: 'Like not found',
      };
    }

    if (likeData.email !== email) {
      return {
        status: 'error',
        message: 'You are not authorized to delete this like',
      };
    }

    // Hapus like
    await likeSnapshot.ref.delete();

    return {
      status: 'ok',
      message: 'Like successfully deleted',
    };
  }
}
