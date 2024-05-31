import { Module } from '@nestjs/common';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ReplyModule } from './reply/reply.module';
import { LikeModule } from './like/like.module';
import { FollowModule } from './follow/follow.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    PostModule,
    CommentModule,
    ReplyModule,
    LikeModule,
    FollowModule,
    GroupModule,
  ],
})
export class CommunityModule {}
