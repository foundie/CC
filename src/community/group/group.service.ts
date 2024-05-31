/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class GroupService {
  private db = admin.firestore();
  private storage = admin.storage();

  async createGroup(
    creator: string,
    title: string,
    topics: string,
    description: string,
    imageFile: Express.Multer.File,
  ) {
    // Validasi input
    if (!creator || !title || !topics || !description || !imageFile) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'All fields must be filled',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Cek apakah judul grup sudah ada
    const existingGroup = await this.db
      .collection('groups')
      .where('title', '==', title)
      .get();
    if (!existingGroup.empty) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          message: 'Group title already exists',
          error: true,
        },
        HttpStatus.CONFLICT,
      );
    }

    // Cek apakah file yang diunggah adalah gambar
    if (!imageFile.mimetype.startsWith('image/')) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Uploaded file is not an image',
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

    const groupRef = this.db.collection('groups').doc();
    const bucket = this.storage.bucket();
    const fileName = `groups/${title}/profileGroup_${Date.now()}`;
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: imageFile.mimetype,
      },
    });

    stream.write(imageFile.buffer);
    stream.end();

    let imageUrl;
    await new Promise<void>((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          const signedUrls = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          imageUrl = signedUrls[0];
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

    const groupData = {
      creator,
      title,
      imageUrl,
      topics: topicsArray,
      description,
      subscription: 0,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    try {
      await groupRef.set(groupData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to create group',
          error: true,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      status: HttpStatus.CREATED,
      message: 'Group successfully created',
      groupId: groupRef.id,
      data: groupData,
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
}
