/* eslint-disable @typescript-eslint/no-unused-vars */
// biodata.service.tss
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class BiodataService {
  private db = admin.firestore();
  private storage = admin.storage();

  async addBiodata(
    email: string,
    phone: string,
    location: string,
    gender: string,
    profileImage: Express.Multer.File,
  ) {
    if (profileImage.size > 1024 * 1024) {
      return {
        status: 'error',
        message: 'Profile image should not be more than 1MB',
      };
    }
    if (!profileImage.mimetype.startsWith('image/')) {
      return {
        status: 'error',
        message: 'Uploaded file is not an image',
      };
    }

    const userDoc = await this.db.collection('users').doc(email).get();
    let userData = userDoc.data();
    const oldImageUrl = userData.profileImageUrl;

    if (oldImageUrl) {
      const oldImageFileName = `user/${email}/profilePicture`;
      const oldImageFile = this.storage.bucket().file(oldImageFileName);
      await oldImageFile.delete();
    }

    const bucket = this.storage.bucket();
    const fileName = `user/${email}/profilePicture`;
    const file = bucket.file(fileName);
    const stream = file.createWriteStream({
      metadata: {
        contentType: profileImage.mimetype,
      },
    });

    stream.write(profileImage.buffer);
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
          reject(error);
        }
      });

      stream.on('error', reject);
    });

    const userDocRef = this.db.collection('users').doc(email);

    userData = userDoc.data();

    if (userData) {
      userData = {
        ...userData,
        phone: phone || userData.phone,
        location: location || userData.location,
        gender: gender || userData.gender,
        profileImageUrl: imageUrl || userData.profileImageUrl,
      };
    } else {
      userData = {
        phone,
        location,
        gender,
        profileImageUrl: imageUrl,
      };
    }
    -(await userDocRef.set(userData, { merge: true }));

    return {
      status: 'ok',
      message: 'Biodata updated successfully',
    };
  }

  async getMyData(email: string) {
    const userDoc = await this.db.collection('users').doc(email).get();
    const { password, ...userData } = userDoc.data();

    return {
      status: 'ok',
      message: 'Biodata fetched successfully',
      user: userData,
    };
  }
}
