import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReplyModule } from './reply/reply.module';
import { LikeModule } from './like/like.module';

@Module({
  imports: [PostModule, CommentModule, ReplyModule, LikeModule],
})
export class CommunityModule {}
