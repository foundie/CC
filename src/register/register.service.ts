// register.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  private db = admin.firestore();
  private storage = admin.storage();

  async register(name: string, email: string, password: string) {
    const userDoc = await this.db.collection('users').doc(email).get();
    if (userDoc.exists) {
      return {
        status: 'error',
        message: 'Email already exists',
      };
    }
    if (!name || !email || !password) {
      return {
        status: 'error',
        message: 'All fields are required',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({
        email,
        password: hashedPassword,
      });
    } catch (error) {
      return {
        status: 'error',
        message: 'The email address is already in use by another account.',
      };
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
    await this.db.collection('users').doc(email).set({
      name,
      email,
      password: hashedPassword,
      role: 'user',
    });

    return {
      status: 'ok',
      message: 'register successfuly',
    };
  }

  async uploadProfileImage(email: string, profileImage: Express.Multer.File) {
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

    // Get the old profile image URL
    const userDoc = await this.db.collection('users').doc(email).get();
    const userData = userDoc.data();
    const oldImageUrl = userData.profileImageUrl;

    // Delete the old profile image from Firebase Storage
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

    await this.db.collection('users').doc(email).update({
      profileImageUrl: imageUrl,
    });

    return {
      status: 'ok',
      message: 'Profile image uploaded successfully',
    };
  }
}
