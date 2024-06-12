/* eslint-disable @typescript-eslint/no-unused-vars */
// biodata.service.tss
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

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
    profileImage?: Express.Multer.File,
    coverImage?: Express.Multer.File,
  ) {
    // Validasi email sebagai parameter wajib
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

    let profileImageUrl;
    if (profileImage) {
      profileImageUrl = await this.uploadImage(
        email,
        profileImage,
        'profilePicture',
      );
    }

    let coverImageUrl;
    if (coverImage) {
      coverImageUrl = await this.uploadImage(email, coverImage, 'coverPicture');
    }

    const userDocRef = this.db.collection('users').doc(email);
    let userData = (await userDocRef.get()).data() || {};

    userData = {
      ...userData,
      name: name ?? userData.name,
      phone: phone ?? userData.phone,
      location: location ?? userData.location,
      gender: gender ?? userData.gender,
      profileImageUrl: profileImageUrl ?? userData.profileImageUrl,
      coverImageUrl: coverImageUrl ?? userData.coverImageUrl,
    };

    await userDocRef.set(userData, { merge: true });

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
      const oldImageFileName = `user/${email}/${imageType}`;
      const oldImageFile = this.storage.bucket().file(oldImageFileName);
      await oldImageFile.delete();
    }

    const bucket = this.storage.bucket();
    const fileName = `user/${email}/${imageType}`;
    const file = bucket.file(fileName);
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
          resolve(signedUrls[0]);
        } catch (error) {
          reject(error);
        }
      });

      stream.on('error', reject);
    });
  }
}
