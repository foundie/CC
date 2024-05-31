// post.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'Title is required',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (imageFiles && imageFiles.length > 5) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: 'You can only upload up to 5 images',
          error: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const postRef = this.db.collection('posts').doc();
    const bucket = this.storage.bucket();
    const imageUrls = [];

    const titleArray = title.split(' ');

    if (imageFiles) {
      const timestamp = Date.now();

      for (const imageFile of imageFiles) {
        if (!imageFile.mimetype.startsWith('image/')) {
          throw new HttpException(
            {
              status: HttpStatus.BAD_REQUEST,
              message: 'Invalid file type. Only images are allowed',
              error: true,
            },
            HttpStatus.BAD_REQUEST,
          );
        }

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
          throw new HttpException(
            {
              status: HttpStatus.INTERNAL_SERVER_ERROR,
              message: 'Failed to upload image',
              error: true,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }

    const postData = {
      postId: postRef.id,
      email,
      title,
      titleArray,
      text,
      imageUrls: imageUrls || [],
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      likesCount: 0,
    };

    await postRef.set(postData);
    const savedPost = await postRef.get();
    const savedPostData = savedPost.data();

    delete savedPostData.titleArray;

    return {
      status: HttpStatus.CREATED,
      message: 'Post successfully created',
      data: savedPostData,
      error: false,
    };
  }

  async getPostData(postId: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();

    if (!postSnapshot.exists) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Post not found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const postData = postSnapshot.data();

    delete postData.titleArray;

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
      status: HttpStatus.OK,
      message: 'Post data successfully retrieved',
      data: {
        post: postData,
        comments: commentsData,
        likes: likesData,
      },
      error: false,
    };
  }

  async getFilteredPosts(q: string, l: number, skip: number, sort: string) {
    let postsQuery: Query<DocumentData> = this.db.collection(
      'posts',
    ) as CollectionReference;

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
    let postsData = postsSnapshot.docs.map((doc) => doc.data());

    // Filter by search query
    if (q) {
      const searchWords = q.split(' ');
      postsData = postsData.filter((post) =>
        searchWords.every((word) => post.titleArray.includes(word)),
      );
    }

    // Remove titleArray from the response
    postsData = postsData.map((post) => {
      delete post.titleArray;
      return post;
    });

    if (postsData.length === 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'No posts found',
          error: true,
        },
        HttpStatus.NOT_FOUND,
      );
    } else {
      return {
        status: HttpStatus.OK,
        message: 'Posts successfully retrieved',
        data: postsData,
        error: false,
      };
    }
  }

  async deletePost(email: string, postId: string) {
    const postSnapshot = await this.db.collection('posts').doc(postId).get();
    const postData = postSnapshot.data();

    if (postData.email !== email) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'You are not authorized to delete this post',
          error: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (postData.imageUrls) {
      for (const imageUrl of postData.imageUrls) {
        const urlParts = decodeURIComponent(imageUrl).split('?')[0].split('/');
        const file = urlParts.slice(4).join('/');
        await this.storage.bucket().file(file).delete();
      }
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
      status: HttpStatus.OK,
      message: 'Post and related data successfully deleted',
      error: false,
    };
  }
}
