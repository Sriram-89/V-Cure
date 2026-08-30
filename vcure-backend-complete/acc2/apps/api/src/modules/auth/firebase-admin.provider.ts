import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { AppConfig } from '../../config/configuration';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<AppConfig, true>) => {
    const firebaseConfig = configService.get('firebase', { infer: true });

    if (admin.apps.length > 0) {
      return admin.app();
    }

    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
    } catch {
      return admin.initializeApp({
        projectId: firebaseConfig.projectId || 'demo-vcure',
      });
    }
  },
};
