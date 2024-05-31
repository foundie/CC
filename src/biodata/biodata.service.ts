/* eslint-disable @typescript-eslint/no-unused-vars */
// biodata.service.tss
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as admin from 'firebase-admin';

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
  ) {
    if (!email && !name && !phone && !location && !gender && !profileImage) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Setidaknya satu field harus diisi',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let imageUrl;
    if (profileImage) {
      if (profileImage.size > 1024 * 1024) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Profile image should not be more than 1MB',
            error: true,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!profileImage.mimetype.startsWith('image/')) {
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
    }

    const userDocRef = this.db.collection('users').doc(email);
    let userData = (await userDocRef.get()).data();

    userData = {
      ...userData,
      name: name !== undefined ? name : userData.name || '',
      phone: phone !== undefined ? phone : userData.phone || '',
      location: location !== undefined ? location : userData.location || '',
      gender: gender !== undefined ? gender : userData.gender || '',
    };

    if (imageUrl) {
      userData.profileImageUrl = imageUrl;
    } else if (userData.profileImageUrl === undefined) {
      userData.profileImageUrl = '';
    }

    await userDocRef.set(userData, { merge: true });

    return {
      status: HttpStatus.CREATED,
      message: 'Biodata updated successfully',
      error: false,
    };
  }

  async getMyData(email: string) {
    const userDoc = await this.db.collection('users').doc(email).get();
    const { password, ...userData } = userDoc.data();

    return {
      status: HttpStatus.OK,
      message: 'Biodata fetched successfully',
      user: userData,
    };
  }
}
