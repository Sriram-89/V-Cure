const { PrismaClient } = require('@prisma/client');

async function testConnection(url) {
  console.log('Testing connection to:', url.replace(/Sriram%40812005/, '********'));
  const prisma = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  try {
    await prisma.$connect();
    console.log('SUCCESS! Connected to DB!');
    const count = await prisma.user.count();
    console.log('User count in DB:', count);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error('FAILED:', err.message);
    try { await prisma.$disconnect(); } catch (e) {}
    return false;
  }
}

async function run() {
  const urls = [
    "postgresql://postgres.mlmlhnealtveagtvbhqw:Sriram%40812005@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public",
    "postgresql://postgres.mlmlhnealtveagtvbhqw:Sriram%40812005@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?schema=public",
    "postgresql://postgres:Sriram%40812005@db.mlmlhnealtveagtvbhqw.supabase.co:5432/postgres?schema=public"
  ];
  for (const url of urls) {
    const res = await testConnection(url);
    if (res) break;
  }
}

run();
