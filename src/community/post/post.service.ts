// post.service.ts
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import {
  CollectionReference,
  DocumentData,
  Query,
} from '@google-cloud/firestore';

@Injectable()
export class PostService {
  private db = admin.firestore();
  private storage = admin.storage();

  async createPost(
    email: string,
    title: string,
    text: string,
    imageFiles: Express.Multer.File[],
  ) {
    if (!title) {
      return {
        status: 'error',
        message: 'Title is required',
      };
    }

    if (imageFiles && imageFiles.length > 5) {
      return {
        status: 'error',
        message: 'You can only upload up to 5 images',
      };
    }

    const postRef = this.db.collection('posts').doc();
    const bucket = this.storage.bucket();
    const imageUrls = [];

    if (imageFiles) {
      const timestamp = Date.now(); // Create timestamp here

      for (const imageFile of imageFiles) {
        if (!imageFile.mimetype.startsWith('image/')) {
          return {
            status: 'error',
            message: 'Invalid file type. Only images are allowed',
          };
        }

        // Use the same timestamp for all images
        const fileName = `user/${email}/posts/${timestamp}/${imageFile.originalname}`;
        const file = bucket.file(fileName);
        const stream = file.createWriteStream({
          metadata: {
            contentType: imageFile.mimetype,
          },
        });

        stream.write(imageFile.buffer);
        stream.end();

        try {
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
                reject(error);
              }
            });

            stream.on('error', reject);
          });
        } catch (error) {
          return {
            status: 'error',
            message: 'Failed to upload image',
          };
        }
      }
    }

    const postData = {
      postId: postRef.id,
      email,
      title,
      text,
      imageUrls: imageUrls || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
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

  async getFilteredPosts(q: string, l: number, skip: number, sort: string) {
    let postsQuery: Query<DocumentData> = this.db.collection(
      'posts',
    ) as CollectionReference;

    // Filter by search query
    if (q) {
      postsQuery = postsQuery.where('title', '==', q);
    }

    // Sorting
    if (sort === 'popular') {
      postsQuery = postsQuery.orderBy('likesCount', 'desc');
    } else {
      postsQuery = postsQuery.orderBy('timestamp', 'desc');
    }

    if (l) {
      postsQuery = postsQuery.limit(l);
    }
    if (skip) {
      postsQuery = postsQuery.offset(skip);
    }

    const postsSnapshot = await postsQuery.get();
    const postsData = postsSnapshot.docs.map((doc) => doc.data());

    if (postsData.length === 0) {
      return {
        status: 'ok',
        message: 'No posts found',
        data: postsData,
      };
    } else {
      return {
        status: 'ok',
        message: 'Posts successfully retrieved',
        data: postsData,
      };
    }
  }

  async deletePost(email: string, postId: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    const postData = postSnapshot.data();

    if (postData.email !== email) {
      return {
        status: 'error',
        message: 'You are not authorized to delete this post',
      };
    }

    if (postData.imageUrl) {
      const urlParts = decodeURIComponent(postData.imageUrl)
        .split('?')[0]
        .split('/');
      const file = urlParts.slice(4).join('/');
      await this.storage.bucket().file(file).delete();
    }

    // Hapus komentar dan balasan
    const commentsQuerySnapshot = await this.db
      .collection('comments')
      .where('postId', '==', postId)
      .get();
    const batch = this.db.batch();
    commentsQuerySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      this.db
        .collection('replies')
        .where('commentId', '==', doc.id)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
        });
    });

    // Hapus suka
    const likesQuerySnapshot = await this.db
      .collection('likes')
      .where('postId', '==', postId)
      .get();
    likesQuerySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Hapus post
    batch.delete(postSnapshot.ref);

    // Jalankan batch
    await batch.commit();
    return {
      status: 'ok',
      message: 'Post and related data successfully deleted',
    };
  }
}
