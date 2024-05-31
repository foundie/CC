import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class LikeService {
  private db = admin.firestore();

  async createLike(email: string, postId: string) {
    const postRef = this.db.collection('posts').doc(postId);
    const postSnapshot = await postRef.get();

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

    const likeSnapshot = await this.db
      .collection('likes')
      .where('email', '==', email)
      .where('postId', '==', postId)
      .get();
    if (!likeSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'You have already liked this post',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    const likeRef = this.db.collection('likes').doc();
    const likeData = {
      email,
      postId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await likeRef.set(likeData);

    // Tambahkan likesCount di post
    await postRef.update({
      likesCount: admin.firestore.FieldValue.increment(1),
    });

    return {
      status: HttpStatus.CREATED,
      message: 'Like successfully created',
      likeId: likeRef.id,
      data: likeData,
      error: false,
    };
  }

  async deleteLike(email: string, likeId: string) {
    const likeRef = this.db.collection('likes').doc(likeId);
    const likeSnapshot = await likeRef.get();
    const likeData = likeSnapshot.data();

    if (!likeSnapshot.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Like not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (likeData.email !== email) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You are not authorized to delete this like',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Hapus like
    await likeRef.delete();

    // Kurangi likesCount di post
    const postRef = this.db.collection('posts').doc(likeData.postId);
    await postRef.update({
      likesCount: admin.firestore.FieldValue.increment(-1),
    });

    return {
      status: HttpStatus.OK,
      message: 'Like successfully deleted',
      error: false,
    };
  }
}
