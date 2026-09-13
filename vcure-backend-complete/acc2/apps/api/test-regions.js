const { PrismaClient } = require('@prisma/client');

async function testConnection(region) {
  const host = `${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.mlmlhnealtveagtvbhqw:Sriram%40812005@${host}:6543/postgres?pgbouncer=true&schema=public`;
  console.log('Testing region:', region);
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    await prisma.$connect();
    console.log('SUCCESS in region:', region);
    const count = await prisma.user.count();
    console.log('User count:', count);
    await prisma.$disconnect();
    return true;
  } catch (err) {
    console.error('FAIL', region, ':', err.message);
    try { await prisma.$disconnect(); } catch (e) {}
    return false;
  }
}

async function run() {
  const regions = [
    'aws-0-ap-south-1',
    'aws-0-ap-southeast-1',
    'aws-0-us-east-1',
    'aws-0-us-west-1',
    'aws-0-eu-central-1',
    'aws-0-eu-west-1',
    'aws-0-sa-east-1'
  ];
  for (const r of regions) {
    const ok = await testConnection(r);
    if (ok) break;
  }
}

run();
