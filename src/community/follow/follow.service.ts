import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FollowService {
  private db = admin.firestore();

  async createFollow(followerEmail: string, followingEmail: string) {
    const userDoc = await this.db.collection('users').doc(followingEmail).get();
    if (!userDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'The user you want to follow does not exist',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const followDoc = await this.db
      .collection('follows')
      .where('followerEmail', '==', followerEmail)
      .where('followingEmail', '==', followingEmail)
      .get();
    if (!followDoc.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'You are already following this user',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    const followRef = this.db.collection('follows').doc();
    const followData = {
      followerEmail,
      followingEmail,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await followRef.set(followData);

    const userRef = this.db.collection('users').doc(followingEmail);
    await userRef.update({
      followsCount: admin.firestore.FieldValue.increment(1),
    });

    await followRef.set(followData);

    return {
      status: HttpStatus.CREATED,
      message: 'Follow successfully created',
      followId: followRef.id,
      data: followData,
      error: false,
    };
  }

  async unfollow(followerEmail: string, followingEmail: string) {
    const followSnapshot = await this.db
      .collection('follows')
      .where('followerEmail', '==', followerEmail)
      .where('followingEmail', '==', followingEmail)
      .get();

    if (followSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'You are not following this user',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const followDoc = followSnapshot.docs[0];
    await this.db.collection('follows').doc(followDoc.id).delete();

    const userRef = this.db.collection('users').doc(followingEmail);
    await userRef.update({
      followsCount: admin.firestore.FieldValue.increment(-1),
    });

    return {
      status: HttpStatus.OK,
      message: 'Unfollowed successfully',
      error: false,
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
      status: HttpStatus.OK,
      message: 'Followers and following successfully retrieved',
      data: {
        Followers: followersData,
        Following: followingData,
      },
      error: false,
    };
  }
}
