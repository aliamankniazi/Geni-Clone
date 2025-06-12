export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthName?: string;
  gender: 'male' | 'female' | 'other';
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  profilePhotoUrl?: string;
  profilePicture?: string;
  bio?: string;
  biography?: string;
  occupation?: string;
  isAlive?: boolean;
  isDeceased?: boolean;
  isPrivate?: boolean;
  spouse?: string;
  mediaCount?: number;
  sourceCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 