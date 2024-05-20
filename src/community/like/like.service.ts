import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class LikeService {
  private db = admin.firestore();

  async createLike(email: string, postId: string) {
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
}
