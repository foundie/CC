/* eslint-disable @typescript-eslint/no-unused-vars */
// biodata.service.tss
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';
import { convertTimestampToDate } from '../utils/timestamp.utils';
import { Timestamp } from 'firebase/firestore';

@Injectable()
export class BiodataService {
  private db = admin.firestore();
  private storage = admin.storage();

  async addBiodata(
    email: string,
    name?: string,
    phone?: string,
    location?: string,
    gender?: string,
    description?: string,
    profileImage?: Express.Multer.File,
    coverImage?: Express.Multer.File,
  ) {
    if (!email) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Email is required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let profileImageUrl, coverImageUrl;

    const uploadPromises = [];
    if (profileImage) {
      uploadPromises.push(
        this.uploadImage(email, profileImage, 'profilePicture'),
      );
    }
    if (coverImage) {
      uploadPromises.push(this.uploadImage(email, coverImage, 'coverPicture'));
    }

    const [profileImageResult, coverImageResult] =
      await Promise.all(uploadPromises);

    if (profileImage) {
      profileImageUrl = profileImageResult;
    }
    if (coverImage) {
      coverImageUrl = coverImageResult;
    }

    const userData = {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(location && { location }),
      ...(gender && { gender }),
      ...(description && { description }),
      ...(profileImageUrl && { profilePictureUrl: profileImageUrl }),
      ...(coverImageUrl && { coverPictureUrl: coverImageUrl }),
    };

    await this.db.collection('users').doc(email).set(userData, { merge: true });

    return {
      status: HttpStatus.CREATED,
      message: 'Biodata updated successfully',
      error: false,
    };
  }

  async getMyData(email: string) {
    // Mengambil data user
    const userDoc = await this.db.collection('users').doc(email).get();
    if (!userDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const userData = userDoc.data();

    // Menghilangkan password dan uid dari response
    const { password, uid, ...safeUserData } = userData;

    // Menghitung jumlah followers
    const followersSnapshot = await this.db
      .collection('follows')
      .where('followingEmail', '==', email)
      .get();
    const followersCount = followersSnapshot.size;

    // Menghitung jumlah following
    const followingSnapshot = await this.db
      .collection('follows')
      .where('followerEmail', '==', email)
      .get();
    const followingCount = followingSnapshot.size;

    // Menambahkan jumlah followers dan following ke data yang akan dikembalikan
    return {
      status: HttpStatus.OK,
      message: 'Biodata fetched successfully',
      user: {
        ...safeUserData,
        followersCount,
        followingCount,
      },
      error: false,
    };
  }

  async addPassword(
    loggedInUserEmail: string,
    email: string,
    password: string,
  ) {
    const userDoc = await this.db.collection('users').doc(email).get();

    // Cek apakah pengguna yang sedang login sama dengan pengguna yang ingin mengubah password
    if (loggedInUserEmail !== email) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          message: "You are not allowed to change another user's password",
          error: true,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (!userDoc.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User does not exist',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!password || password.length < 8) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Password must be at least 8 characters long',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Menambahkan password ke pengguna yang sudah ada
    await this.db.collection('users').doc(email).update({
      password: hashedPassword,
    });

    return {
      status: HttpStatus.OK,
      message: 'Password added successfully',
      error: false,
    };
  }

  async getUserProfile(email: string) {
    const userProfile = await this.db.collection('users').doc(email).get();
    if (!userProfile.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    let userData = userProfile.data();

    const { password, uid, role, ...safeUserData } = userData;
    userData = safeUserData;

    const postsSnapshot = await this.db
      .collection('posts')
      .where('email', '==', email)
      .get();
    const posts = postsSnapshot.docs.map((doc) => {
      const postData = doc.data();
      // Konversi timestamp untuk setiap post
      postData.timestamp = convertTimestampToDate(
        postData.timestamp as Timestamp,
      );
      return postData;
    });

    const groupMembershipsSnapshot = await this.db
      .collection('groupMemberships')
      .where('email', '==', email)
      .get();
    const groups = groupMembershipsSnapshot.docs.map((doc) => {
      const groupData = doc.data();
      // Konversi timestamp untuk setiap keanggotaan grup
      groupData.joinedAt = convertTimestampToDate(
        groupData.joinedAt as Timestamp,
      );
      return groupData;
    });

    const followersSnapshot = await this.db
      .collection('follows')
      .where('followingEmail', '==', email)
      .get();
    const followersCount = followersSnapshot.size;

    const followingSnapshot = await this.db
      .collection('follows')
      .where('followerEmail', '==', email)
      .get();
    const followingCount = followingSnapshot.size;

    return {
      status: HttpStatus.OK,
      message: 'User profile fetched successfully',
      data: {
        user: userData,
        posts,
        groups,
        followersCount,
        followingCount,
      },
      error: false,
    };
  }

  private async uploadImage(
    email: string,
    imageFile: Express.Multer.File,
    imageType: string,
  ): Promise<string> {
    if (imageFile.size > 1024 * 1024) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `${imageType} should not be more than 1MB`,
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
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

    const userDoc = await this.db.collection('users').doc(email).get();
    const userData = userDoc.data();
    const oldImageUrl = userData[imageType + 'Url'];
    if (oldImageUrl) {
      const oldImageFileName = oldImageUrl
        .replace('https://storage.googleapis.com/storage-foundie/', '')
        .split('?')[0];

      await this.storage
        .bucket('storage-foundie')
        .file(decodeURIComponent(oldImageFileName))
        .delete();
    }

    const timestamp = new Date().getTime();
    const newFileName = `user/${email}/${imageType}_${timestamp}`;

    const bucket = this.storage.bucket();
    const file = bucket.file(newFileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: imageFile.mimetype,
      },
    });

    stream.write(imageFile.buffer);
    stream.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', async () => {
        try {
          const signedUrls = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491',
          });
          await this.db
            .collection('users')
            .doc(email)
            .update({
              [imageType + 'Url']: signedUrls[0],
            });
          resolve(signedUrls[0]);
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });
  }
}
