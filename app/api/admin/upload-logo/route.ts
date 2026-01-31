import admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin SDK (only once)
let adminApp: admin.app.App | null = null;

function initializeAdmin() {
  if (adminApp) return adminApp;

  try {
    let serviceAccount: any;

    // Try to read from environment variable first (Vercel)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Firebase service account loaded from environment variable');
    } else {
      // Fall back to file system for local development
      const keyPath = join(process.cwd(), 'serviceAccountKey.json');
      const serviceAccountJson = readFileSync(keyPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountJson);
      console.log('Firebase service account loaded from local file');
    }

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'designer-portfolio-b027a.firebasestorage.app',
    });
    console.log('Firebase Admin SDK initialized successfully');
    return adminApp;
  } catch (error: any) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Initialize Admin SDK
    initializeAdmin();

    const formData = await req.formData();
    const file = formData.get('logo') as File;
    const designerName = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage using Admin SDK
    const bucket = admin.storage().bucket();
    const filename = `settings/logo-${Date.now()}`;
    const fileRef = bucket.file(filename);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make file publicly readable
    await fileRef.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    // Update Firestore using Admin SDK
    const db = admin.firestore();
    await db.collection('settings').doc('main').set(
      {
        logo: publicUrl,
        name: designerName,
      },
      { merge: true }
    );

    return NextResponse.json({ 
      success: true, 
      logoUrl: publicUrl 
    });
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
