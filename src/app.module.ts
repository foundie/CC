import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { RegisterModule } from './register/register.module';
import { jwtConstants } from './auth/auth.secret';
import { JwtStrategy } from './guard/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ProductModule } from './product/product.module';
import { CommunityModule } from './community/community.module';
import { BiodataModule } from './biodata/biodata.module';

@Module({
  imports: [
    ChatModule,
    AuthModule,
    RegisterModule,
    CommunityModule,
    ProductModule,
    BiodataModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}