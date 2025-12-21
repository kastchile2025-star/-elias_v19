import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics: any = {
    firebase: {
      hasProjectId: false,
      projectIdSource: null as string | null,
      hasServiceAccountJSON: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
      hasGoogleAppCreds: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
      env: {} as Record<string,string|undefined>,
      initialized: false,
      adminAppCount: 0,
      error: null as string | null,
    }
  };

  try {
    const admin = (await import('firebase-admin')).default;
    diagnostics.firebase.adminAppCount = admin.apps.length;

    const sources: [string, string | undefined][] = [
      ['FIREBASE_PROJECT_ID', process.env.FIREBASE_PROJECT_ID],
      ['NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
      ['GOOGLE_CLOUD_PROJECT', process.env.GOOGLE_CLOUD_PROJECT],
      ['GCLOUD_PROJECT', process.env.GCLOUD_PROJECT]
    ];
    for (const [k,v] of sources) if (v) { diagnostics.firebase.hasProjectId = true; diagnostics.firebase.projectIdSource = k; break; }
    diagnostics.firebase.env = Object.fromEntries(sources);

    if (admin.apps.length === 0) {
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        let credential: any;
        let projectId: string | undefined;
        
        // Estrategia 1: Variable de entorno
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
          try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
          } catch (e) {
            diagnostics.firebase.error = 'Error parseando FIREBASE_SERVICE_ACCOUNT_JSON: ' + String(e);
          }
        }
        
        // Estrategia 2: Archivo directo
        if (!credential) {
          try {
            const credentialPath = path.join(process.cwd(), 'superjf1234-e9cbc-firebase-adminsdk-fbsvc-bb61d6f53d.json');
            const credentialFile = await fs.readFile(credentialPath, 'utf-8');
            const serviceAccount = JSON.parse(credentialFile);
            credential = admin.credential.cert(serviceAccount);
            projectId = serviceAccount.project_id;
          } catch (e) {
            if (!diagnostics.firebase.error) {
              diagnostics.firebase.error = 'No se encontró archivo de credenciales ni variable de entorno';
            }
          }
        }
        
        if (!projectId) {
          projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
        }
        
        if (credential) {
          const appOptions: any = { credential };
          if (projectId) {
            appOptions.projectId = projectId;
            process.env.GOOGLE_CLOUD_PROJECT = projectId;
            process.env.GCLOUD_PROJECT = projectId;
            process.env.FIREBASE_CONFIG = JSON.stringify({ projectId });
          }
          admin.initializeApp(appOptions);
        }
      } catch (e:any) {
        diagnostics.firebase.error = e?.message || String(e);
      }
    }

    diagnostics.firebase.initialized = admin.apps.length > 0;
    diagnostics.firebase.adminAppCount = admin.apps.length;

  } catch (e:any) {
    diagnostics.firebase.error = e?.message || String(e);
  }

  return NextResponse.json(diagnostics);
}
