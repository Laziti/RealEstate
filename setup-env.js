// setup-env.js - Helper script to create a .env.local file with Supabase credentials
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔑 Supabase Environment Setup Helper 🔑\n');
console.log('This script will help you create a .env.local file with your Supabase credentials.');
console.log('You can find these values in your Supabase project dashboard under Project Settings > API.\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createEnvFile() {
  try {
    const supabaseUrl = await askQuestion('Enter your Supabase URL (e.g., https://your-project-id.supabase.co): ');
    const supabaseAnonKey = await askQuestion('Enter your Supabase anon key (starts with "eyJ..."): ');
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('\n⚠️ Error: Both Supabase URL and anon key are required.');
      const retry = await askQuestion('Would you like to try again? (y/n): ');
      if (retry.toLowerCase() === 'y') {
        return createEnvFile();
      } else {
        console.log('\n❌ Setup cancelled. No .env.local file was created.');
        return;
      }
    }
    
    const envContent = `VITE_SUPABASE_URL=${supabaseUrl.trim()}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey.trim()}
`;
    
    const envPath = path.join(process.cwd(), '.env.local');
    
    // Check if file already exists
    if (fs.existsSync(envPath)) {
      const overwrite = await askQuestion('\n⚠️ Warning: .env.local already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n❌ Setup cancelled. Existing .env.local file was not modified.');
        return;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Success! .env.local file has been created with your Supabase credentials.');
    console.log('📝 Remember to restart your development server for the changes to take effect.');
    console.log('\nYou can now run:');
    console.log('  npm run dev\n');
    
  } catch (error) {
    console.error('\n❌ Error creating .env.local file:', error.message);
  } finally {
    rl.close();
  }
}

createEnvFile(); 