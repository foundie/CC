import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterService {
  async register(email: string, password: string, role: string) {
    // Enkripsi password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan pengguna baru ke Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password: hashedPassword,
    });

    // Menetapkan customClaims setelah pengguna dibuat
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    // Simpan data pengguna ke Firestore
    const db = admin.firestore();
    await db.collection('users').doc(email).set({
      email,
      password: hashedPassword,
      role,
    });

    return userRecord;
  }
}
