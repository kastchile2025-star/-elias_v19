// Script to clear demo data from localStorage
// Run this in browser console (F12 -> Console tab)

console.log('🧹 Clearing all demo data from localStorage...');

// List of all possible keys that might contain demo data
const keysToCheck = [
  'smart-student-tasks',
  'smart-student-submissions', 
  'smart-student-attendance',
  'smart-student-assignments',
  'smart-student-users',
  'smart-student-courses',
  'smart-student-sections',
  'smart-student-course-sections'
];

// Get current year and check for year-suffixed keys
const currentYear = new Date().getFullYear();
const yearSuffixedKeys = keysToCheck.map(key => `${key}-${currentYear}`);

// Combine all possible keys
const allKeys = [...keysToCheck, ...yearSuffixedKeys];

let clearedCount = 0;

// Clear each key
allKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`❌ Removing: ${key}`);
    localStorage.removeItem(key);
    clearedCount++;
  }
});

// Also clear sessionStorage for demo seeding tracking
if (sessionStorage.getItem('stats-demo-seeded-keys')) {
  console.log('❌ Removing: stats-demo-seeded-keys (sessionStorage)');
  sessionStorage.removeItem('stats-demo-seeded-keys');
  clearedCount++;
}

console.log(`✅ Cleared ${clearedCount} items`);
console.log('🔄 Reloading page to show clean state...');

// Reload the page to reflect changes
setTimeout(() => {
  location.reload();
}, 1000);
