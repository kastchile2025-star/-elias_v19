
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function main() {
  // Initialize Firebase
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    credential = admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
  } else {
    // Try to find the file
    const secretPath = '/workspaces/peloduro_v2/.secrets/firebase-admin.json';
    if (fs.existsSync(secretPath)) {
      console.log(`Found credential file: ${secretPath}`);
      credential = admin.credential.cert(require(secretPath));
    } else {
      const files = fs.readdirSync('.');
      const credFile = files.find(f => f.endsWith('.json') && f.includes('firebase-adminsdk'));
      if (credFile) {
        console.log(`Found credential file: ${credFile}`);
        credential = admin.credential.cert(require(path.resolve(credFile)));
      } else {
        console.error('No credential file found');
        process.exit(1);
      }
    }
  }

  admin.initializeApp({
    credential
  });

  const db = admin.firestore();
  const year = 2025;

  console.log(`Checking attendance for year ${year}...`);

  const coursesSnapshot = await db.collection('courses').get();
  console.log(`Found ${coursesSnapshot.size} courses.`);

  let angelRecords = [];
  let totalRecords = 0;

  for (const courseDoc of coursesSnapshot.docs) {
    const courseId = courseDoc.id;
    const attRef = db.collection(`courses/${courseId}/attendance`);
    const snapshot = await attRef.where('year', '==', year).get();
    
    if (snapshot.empty) continue;
    totalRecords += snapshot.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      const studentUsername = data.studentUsername;
      const studentId = data.studentId;
      
      if (studentUsername && studentUsername.toLowerCase().includes('gonzalez0377')) {
        angelRecords.push({
          id: doc.id,
          courseId,
          studentUsername,
          studentId,
          date: data.dateString
        });
      }
    });
  }

  console.log(`Total attendance records: ${totalRecords}`);
  console.log(`Records for Angel (gonzalez0377): ${angelRecords.length}`);
  
  if (angelRecords.length > 0) {
    console.log('Sample records:');
    angelRecords.slice(0, 5).forEach(r => console.log(r));
    
    // Check exact username
    const usernames = [...new Set(angelRecords.map(r => r.studentUsername))];
    console.log('Unique usernames found for Angel:', usernames);
  } else {
    console.log('No records found for Angel.');
  }
}

main().catch(console.error);
