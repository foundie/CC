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
      followersCount: admin.firestore.FieldValue.increment(1),
    });

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
      followersCount: admin.firestore.FieldValue.increment(-1),
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

    // Get all group memberships of the user
    const groupMembershipSnapshot = await this.db
      .collection('groupMemberships')
      .where('email', '==', email)
      .get();

    const groupMembershipData = [];
    for (const doc of groupMembershipSnapshot.docs) {
      const groupId = doc.data().groupId;
      const groupSnapshot = await this.db
        .collection('groups')
        .doc(groupId)
        .get();
      const groupData = groupSnapshot.data();
      groupMembershipData.push({
        groupId: groupId,
        title: groupData.title,
      });
    }

    return {
      status: HttpStatus.OK,
      message:
        'Followers, following, and group memberships successfully retrieved',
      data: {
        Followers: followersData,
        Following: followingData,
        GroupMemberships: groupMembershipData,
      },
      error: false,
    };
  }
}
