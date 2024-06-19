/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase/firestore';
import { convertTimestampToDate } from '../../utils/timestamp.utils';
import { plainToClass } from 'class-transformer';
import { UserDto } from './dto/user.dto';

@Injectable()
export class GroupService {
  private db = admin.firestore();
  private storage = admin.storage();

  async createGroup(
    creator: string,
    title: string,
    topics: string,
    description?: string,
    profileImageFile?: Express.Multer.File,
    coverImageFile?: Express.Multer.File,
  ) {
    // Validasi input wajib
    if (!creator || !title || !topics) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Creator, title, and topics are required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Memisahkan topik berdasarkan tanda koma dan memvalidasi jumlah topik
    const topicsArray = topics.split(',').map((topic) => topic.trim());
    if (topicsArray.length > 5) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Maximum number of topics is 5',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Buat referensi dokumen grup dengan ID unik
    const groupRef = this.db.collection('groups').doc();
    const groupId = groupRef.id;

    let profileImageUrl = '';
    let coverImageUrl = '';

    // Logika pengunggahan foto profil jika file disediakan
    if (profileImageFile && profileImageFile.mimetype.startsWith('image/')) {
      const profileFileName = `groups/${groupId}/profileGroup_${Date.now()}`;
      profileImageUrl = await this.uploadImage(
        profileImageFile,
        profileFileName,
      );
    }

    // Logika pengunggahan foto sampul jika file disediakan
    if (coverImageFile && coverImageFile.mimetype.startsWith('image/')) {
      const coverFileName = `groups/${groupId}/coverGroup_${Date.now()}`;
      coverImageUrl = await this.uploadImage(coverImageFile, coverFileName);
    }

    // Buat data grup dengan field opsional
    const groupData = {
      id: groupId,
      creator,
      title,
      topics: topicsArray,
      description: description || '',
      profileImageUrl: profileImageUrl || '',
      coverImageUrl: coverImageUrl || '',
      subscription: 1, // Mulai dengan 1 anggota (pembuat grup)
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Buat entri keanggotaan grup untuk pembuat grup
    const membershipData = {
      email: creator,
      groupId: groupId,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const membershipRef = this.db.collection('groupMemberships').doc();

    try {
      // Simpan data grup dan keanggotaan dalam satu transaksi
      await this.db.runTransaction(async (transaction) => {
        transaction.set(groupRef, groupData);
        transaction.set(membershipRef, membershipData);
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to create group and add membership',
          error: true,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      status: HttpStatus.CREATED,
      message: 'Group successfully created and creator added as a member',
      groupId: groupId,
      data: groupData,
      error: false,
    };
  }

  async updateGroup(
    groupId: string,
    email: string,
    title?: string,
    topics?: string,
    description?: string,
    profileImageFile?: Express.Multer.File,
    coverImageFile?: Express.Multer.File,
  ) {
    const groupRef = this.db.collection('groups').doc(groupId);
    const groupSnapshot = await groupRef.get();

    if (!groupSnapshot.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Group not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const groupData = groupSnapshot.data();

    if (groupData.creator !== email) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You are not authorized to update this group',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    let profileImageUrl = groupData.profileImageUrl;
    if (profileImageFile && profileImageFile.mimetype.startsWith('image/')) {
      if (profileImageUrl) {
        const profileImageName = profileImageUrl.split('/').pop().split('?')[0];
        await this.storage
          .bucket()
          .file(`groups/${groupId}/${profileImageName}`)
          .delete();
      }
      const profileFileName = `groups/${groupId}/profileGroup_${Date.now()}`;
      profileImageUrl = await this.uploadImage(
        profileImageFile,
        profileFileName,
      );
    }

    let coverImageUrl = groupData.coverImageUrl;
    if (coverImageFile && coverImageFile.mimetype.startsWith('image/')) {
      if (coverImageUrl) {
        const coverImageName = coverImageUrl.split('/').pop().split('?')[0];
        await this.storage
          .bucket()
          .file(`groups/${groupId}/${coverImageName}`)
          .delete();
      }
      const coverFileName = `groups/${groupId}/coverGroup_${Date.now()}`;
      coverImageUrl = await this.uploadImage(coverImageFile, coverFileName);
    }

    const updatedGroupData = {
      ...groupData,
      title: title || groupData.title,
      topics: topics
        ? topics.split(',').map((topic) => topic.trim())
        : groupData.topics,
      description: description || groupData.description,
      profileImageUrl,
      coverImageUrl,
    };

    await groupRef.set(updatedGroupData, { merge: true });

    return {
      status: HttpStatus.OK,
      message: 'Group updated successfully',
      data: updatedGroupData,
    };
  }

  async getFilteredGroups(
    q?: string,
    l?: number,
    skip?: number,
    sort?: string,
  ) {
    let groupsQuery: admin.firestore.Query = this.db.collection('groups');
    const allGroupsSnapshot = await groupsQuery.get();
    let allGroupsData = allGroupsSnapshot.docs.map((doc) => doc.data());

    if (q) {
      const searchWords = q.toLowerCase().split(' ');
      allGroupsData = allGroupsData.filter((group) =>
        searchWords.some(
          (word) =>
            group.title.toLowerCase().includes(word) ||
            group.topics.some((topic) => topic.toLowerCase().includes(word)),
        ),
      );
    }

    if (sort === 'popular') {
      allGroupsData.sort((a, b) => b.subscription - a.subscription);
    } else {
      allGroupsData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
    }

    const startIndex = skip || 0;
    const endIndex = startIndex + (l || allGroupsData.length);
    const groupsData = allGroupsData.slice(startIndex, endIndex);

    const convertedGroupsData = groupsData.map((group) => ({
      ...group,
      timestamp: convertTimestampToDate(
        new Timestamp(group.timestamp._seconds, group.timestamp._nanoseconds),
      ),
    }));

    // Return results
    if (convertedGroupsData.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: true,
          message: 'No groups found',
        },
        HttpStatus.NOT_FOUND,
      );
    } else {
      return {
        status: HttpStatus.OK,
        message: 'Groups successfully retrieved',
        error: false,
        data: convertedGroupsData,
      };
    }
  }

  async getFilteredUsers(q?: string, l?: number, skip?: number, sort?: string) {
    let usersQuery: admin.firestore.Query = this.db.collection('users');
    const allUsersSnapshot = await usersQuery.get();
    let allUsersData = allUsersSnapshot.docs.map((doc) => {
      return plainToClass(UserDto, doc.data());
    });

    // Filter berdasarkan query pencarian
    if (q) {
      const searchWords = q.toLowerCase().split(' ');
      allUsersData = allUsersData.filter((user) =>
        searchWords.some(
          (word) =>
            user.name.toLowerCase().includes(word) ||
            user.email.toLowerCase().includes(word),
        ),
      );
    }

    // Terapkan sorting
    if (sort === 'popular') {
      allUsersData.sort((a, b) => b.followersCount - a.followersCount);
    } else {
      allUsersData.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Terapkan limit dan skip
    const startIndex = skip || 0;
    const endIndex = startIndex + (l || allUsersData.length);
    const usersData = allUsersData.slice(startIndex, endIndex);

    // Return results
    if (usersData.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: true,
          message: 'No users found',
        },
        HttpStatus.NOT_FOUND,
      );
    } else {
      return {
        status: HttpStatus.OK,
        message: 'Groups successfully retrieved',
        error: false,
        data: usersData,
      };
    }
  }

  async deleteGroup(email: string, groupId: string) {
    await this.db.runTransaction(async (transaction) => {
      const groupRef = this.db.collection('groups').doc(groupId);
      const groupSnapshot = await transaction.get(groupRef);

      if (!groupSnapshot.exists) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: 'Group not found',
            error: true,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const groupData = groupSnapshot.data();
      // Validasi pembuat grup
      if (groupData.creator !== email) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            message: 'You are not authorized to delete this group',
            error: true,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Hapus foto profil dan sampul grup
      if (groupData.profileImageUrl) {
        const profileUrlParts = decodeURIComponent(groupData.profileImageUrl)
          .split('?')[0]
          .split('/');
        const profileFile = profileUrlParts.slice(4).join('/');
        await this.storage.bucket().file(profileFile).delete();
      }
      if (groupData.coverImageUrl) {
        const coverUrlParts = decodeURIComponent(groupData.coverImageUrl)
          .split('?')[0]
          .split('/');
        const coverFile = coverUrlParts.slice(4).join('/');
        await this.storage.bucket().file(coverFile).delete();
      }

      // Hapus semua file postingan grup dari penyimpanan
      await this.deleteGroupFiles(groupId);

      // Hapus postingan grup, komentar, balasan, suka, dan keanggotaan
      const postsQuerySnapshot = await this.db
        .collection('posts')
        .where('groupId', '==', groupId)
        .get();
      for (const postDoc of postsQuerySnapshot.docs) {
        const postId = postDoc.id;

        // Hapus komentar, balasan, dan suka yang terkait dengan postingan
        const commentsQuerySnapshot = await this.db
          .collection('comments')
          .where('postId', '==', postId)
          .get();
        for (const commentDoc of commentsQuerySnapshot.docs) {
          const commentId = commentDoc.id;

          // Hapus balasan yang terkait dengan komentar
          const repliesQuerySnapshot = await this.db
            .collection('replies')
            .where('commentId', '==', commentId)
            .get();
          for (const replyDoc of repliesQuerySnapshot.docs) {
            transaction.delete(replyDoc.ref);
          }

          // Hapus komentar
          transaction.delete(commentDoc.ref);
        }

        // Hapus suka yang terkait dengan postingan
        const likesQuerySnapshot = await this.db
          .collection('likes')
          .where('postId', '==', postId)
          .get();
        for (const likeDoc of likesQuerySnapshot.docs) {
          transaction.delete(likeDoc.ref);
        }

        // Hapus postingan
        transaction.delete(postDoc.ref);
      }

      // Hapus keanggotaan grup
      const membershipsQuerySnapshot = await this.db
        .collection('groupMemberships')
        .where('groupId', '==', groupId)
        .get();
      for (const membershipDoc of membershipsQuerySnapshot.docs) {
        transaction.delete(membershipDoc.ref);
      }

      // Hapus grup
      transaction.delete(groupRef);
    });

    return {
      status: HttpStatus.OK,
      message: 'Group and all related data successfully deleted',
      error: false,
    };
  }

  async joinGroup(email: string, groupId: string) {
    // Cek apakah grup ada
    const groupDoc = await this.db.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'The group does not exist',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Cek apakah pengguna sudah bergabung dengan grup
    const membershipSnapshot = await this.db
      .collection('groupMemberships')
      .where('email', '==', email)
      .where('groupId', '==', groupId)
      .get();
    if (!membershipSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'You are already a member of this group',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Bergabung dengan grup
    const groupRef = this.db.collection('groups').doc(groupId);
    const groupData = (await groupRef.get()).data();

    // Tambahkan 1 ke subscription
    groupData.subscription += 1;
    await groupRef.update(groupData);

    const membershipRef = this.db.collection('groupMemberships').doc();
    const membershipData = {
      email,
      groupId,
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await membershipRef.set(membershipData);

    return {
      status: HttpStatus.CREATED,
      message: 'Successfully joined the group',
      membershipId: membershipRef.id,
      data: membershipData,
      error: false,
    };
  }

  async leaveGroup(email: string, groupId: string) {
    // Cek apakah grup ada
    const groupRef = this.db.collection('groups').doc(groupId);
    const groupDoc = await groupRef.get();
    if (!groupDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'The group does not exist',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Cek apakah pengguna adalah anggota grup
    const membershipSnapshot = await this.db
      .collection('groupMemberships')
      .where('email', '==', email)
      .where('groupId', '==', groupId)
      .get();
    if (membershipSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'You are not a member of this group',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Hapus keanggotaan grup
    const membershipId = membershipSnapshot.docs[0].id;
    await this.db.collection('groupMemberships').doc(membershipId).delete();

    // Kurangi 1 dari subscription
    const groupData = groupDoc.data();
    groupData.subscription -= 1;
    await groupRef.update(groupData);

    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully left the group',
      error: false,
    };
  }

  async createGroupPost(
    email: string,
    groupId: string,
    title: string,
    text: string,
    imageFiles: Express.Multer.File[],
  ) {
    // Validasi input
    if (!email || !groupId || !title || !text || !imageFiles) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'All fields must be filled',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cek apakah pengguna adalah anggota grup
    const membershipSnapshot = await this.db
      .collection('groupMemberships')
      .where('email', '==', email)
      .where('groupId', '==', groupId)
      .get();
    if (membershipSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'You are not a member of this group',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Buat postingan di dalam grup
    const postRef = this.db.collection('posts').doc();
    const bucket = this.storage.bucket();
    const imageUrls = [];

    for (const imageFile of imageFiles) {
      const fileName = `groups/${groupId}/posts/${Date.now()}_${imageFile.originalname}`;
      const file = bucket.file(fileName);
      const stream = file.createWriteStream({
        metadata: {
          contentType: imageFile.mimetype,
        },
      });

      stream.write(imageFile.buffer);
      stream.end();

      await new Promise<void>((resolve, reject) => {
        stream.on('finish', async () => {
          try {
            const signedUrls = await file.getSignedUrl({
              action: 'read',
              expires: '03-09-2491',
            });
            imageUrls.push(signedUrls[0]);
            resolve();
          } catch (error) {
            reject(
              new HttpException(
                {
                  status: HttpStatus.INTERNAL_SERVER_ERROR,
                  message: 'Failed to upload image',
                  error: true,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }
        });

        stream.on('error', (error) => {
          reject(
            new HttpException(
              {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to upload image',
                error: true,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        });
      });
    }

    const postData = {
      postId: postRef.id,
      email,
      groupId,
      title,
      text,
      imageUrls,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
      groupPost: true,
    };

    await postRef.set(postData);
    return {
      status: HttpStatus.CREATED,
      message: 'Post successfully created',
      data: postData,
    };
  }

  async getGroupMembers(groupId: string) {
    const membershipsSnapshot = await this.db
      .collection('groupMemberships')
      .where('groupId', '==', groupId)
      .get();

    if (membershipsSnapshot.empty) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No members found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const membersData = membershipsSnapshot.docs.map((doc) => doc.data());

    return {
      status: HttpStatus.OK,
      message: 'Members successfully retrieved',
      data: membersData,
      error: false,
    };
  }

  private async uploadImage(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<string> {
    const bucket = this.storage.bucket();
    const fileRef = bucket.file(fileName);
    const stream = fileRef.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.write(file.buffer);
    stream.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          const signedUrls = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          resolve(signedUrls[0]);
        } catch (error) {
          reject(
            new HttpException(
              {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Failed to upload image',
                error: true,
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          );
        }
      });

      stream.on('error', (error) => {
        reject(
          new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Failed to upload image',
              error: true,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });
    });
  }

  private async deleteGroupFiles(groupId: string) {
    const bucket = this.storage.bucket();
    const directory = `groups/${groupId}/posts`;

    const [files] = await bucket.getFiles({ prefix: directory });
    const deletePromises = files.map((file) => file.delete());

    await Promise.all(deletePromises);
  }
}
