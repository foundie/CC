// follow.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FollowService {
  private db = admin.firestore();

  async createFollow(followerEmail: string, followingEmail: string) {
    // Cek apakah pengguna yang ingin diikuti ada di database
    const userDoc = await this.db.collection('users').doc(followingEmail).get();
    if (!userDoc.exists) {
      return {
        status: 'error',
        message: 'The user you want to follow does not exist',
      };
    }

    // Cek apakah pengguna yang saat ini masuk sudah mengikuti pengguna tersebut
    const followDoc = await this.db
      .collection('follows')
      .where('followerEmail', '==', followerEmail)
      .where('followingEmail', '==', followingEmail)
      .get();
    if (!followDoc.empty) {
      return {
        status: 'error',
        message: 'You are already following this user',
      };
    }

    const followRef = this.db.collection('follows').doc();
    const followData = {
      followerEmail,
      followingEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await followRef.set(followData);

    // Tambahkan followCount ke pengguna yang diikuti
    const userRef = this.db.collection('users').doc(followingEmail);
    await userRef.update({
      followsCount: admin.firestore.FieldValue.increment(1),
    });

    await followRef.set(followData);

    return {
      status: 'ok',
      message: 'Follow successfully created',
      followId: followRef.id,
      data: followData,
    };
  }

  async unfollow(followerEmail: string, followingEmail: string) {
    // Cari follow dalam database
    const followSnapshot = await this.db
      .collection('follows')
      .where('followerEmail', '==', followerEmail)
      .where('followingEmail', '==', followingEmail)
      .get();

    // Jika follow tidak ada, kembalikan pesan kesalahan
    if (followSnapshot.empty) {
      return {
        status: 'error',
        message: 'You are not following this user',
      };
    }

    // Hapus follow dari database
    const followDoc = followSnapshot.docs[0];
    await this.db.collection('follows').doc(followDoc.id).delete();

    // Kurangi followsCount dari pengguna yang diikuti
    const userRef = this.db.collection('users').doc(followingEmail);
    await userRef.update({
      followsCount: admin.firestore.FieldValue.increment(-1),
    });

    return {
      status: 'ok',
      message: 'Unfollowed successfully',
    };
  }

  async getFollowersAndFollowing(email: string) {
    const followersSnapshot = await this.db
      .collection('follows')
      .where('followingEmail', '==', email)
      .get();
    const followersData = followersSnapshot.docs.map(
      (doc) => doc.data().followerEmail,
    );

    const followingSnapshot = await this.db
      .collection('follows')
      .where('followerEmail', '==', email)
      .get();
    const followingData = followingSnapshot.docs.map(
      (doc) => doc.data().followingEmail,
    );

    return {
      status: 'ok',
      message: 'Followers and following successfully retrieved',
      data: {
        Followers: followersData,
        Following: followingData,
      },
    };
  }
}
