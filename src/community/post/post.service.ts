// post.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class PostService {
  private db = admin.firestore();
  private storage = admin.storage();

  async createPost(
    email: string,
    title: string,
    text: string,
    imageFile: Express.Multer.File,
  ) {
    const postRef = this.db.collection('posts').doc();
    const bucket = this.storage.bucket();
    const fileName = `user/${email}/posts/${Date.now()}/${imageFile.originalname}`;
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
          reject(error);
        }
      });

      stream.on('error', reject);
    });

    const postData = {
      postId: postRef.id,
      email,
      title,
      text,
      imageUrl,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    await postRef.set(postData);
    const savedPost = await postRef.get();
    const savedPostData = savedPost.data();

    return {
      status: 'ok',
      message: 'Post successfully created',
      data: savedPostData,
    };
  }

  async getPostData(postId: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    const postData = postSnapshot.data();

    const commentsQuerySnapshot = await this.db
      .collection('comments')
      .where('postId', '==', postId)
      .get();
    const commentsData = commentsQuerySnapshot.docs.map((doc) => doc.data());

    for (const comment of commentsData) {
      const repliesQuerySnapshot = await this.db
        .collection('replies')
        .where('commentId', '==', comment.commentId)
        .get();
      comment.replies = repliesQuerySnapshot.docs.map((doc) => doc.data());
    }

    const likesQuerySnapshot = await this.db
      .collection('likes')
      .where('postId', '==', postId)
      .get();
    const likesData = likesQuerySnapshot.docs.map((doc) => doc.data());

    return {
      status: 'ok',
      message: 'Post data successfully retrieved',
      data: {
        post: postData,
        comments: commentsData,
        likes: likesData,
      },
    };
  }
}
