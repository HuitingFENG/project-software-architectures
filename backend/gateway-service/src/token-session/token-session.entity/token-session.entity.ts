// export class TokenSessionEntity {}


// gateway-service/src/token-session/tokenSession.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TokenSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tokenId: string;

  @Column('json')
  userDetails: any;

  @Column()
  expiresAt: Date;
}