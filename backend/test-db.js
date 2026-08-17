const { Client } = require('pg');
const fs = require('fs');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'us-east-1', 'us-east-2', 
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'ap-northeast-1', 
  'ap-northeast-2', 'ap-southeast-2', 'us-west-1', 'us-west-2', 
  'ca-central-1', 'sa-east-1'
];

async function testRegions() {
  for (const region of regions) {
    const connStr = `postgresql://postgres.zbselirlxmqjvmbdynjs:ApveuFuJNfX2qb1o@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    console.log(`Testing region: ${region}`);
    
    const client = new Client({ connectionString: connStr, connectionTimeoutMillis: 3000 });
    try {
      await client.connect();
      console.log(`\nSUCCESS! Connected via region: ${region}`);
      
      // Update .env
      const envPath = './.env';
      let envContent = fs.readFileSync(envPath, 'utf8');
      envContent = envContent.replace(/DATABASE_URL=".+"/, `DATABASE_URL="${connStr}"`);
      fs.writeFileSync(envPath, envContent);
      console.log('.env updated successfully!');
      
      await client.end();
      return;
    } catch (err) {
      console.log(`Failed: ${err.message}`);
    }
  }
  console.log('Could not connect to any region.');
}

testRegions();
