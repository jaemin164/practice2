const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'test1@karrot.com' },
    update: {},
    create: {
      email: 'test1@karrot.com',
      password: hashed,
      nickname: '당근이',
      location: '서울 마포구',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'test2@karrot.com' },
    update: {},
    create: {
      email: 'test2@karrot.com',
      password: hashed,
      nickname: '토끼',
      location: '서울 강남구',
    },
  });

  const seedProducts = [
    {
      title: '아이폰 14 Pro 판매',
      description: '6개월 사용, 상태 최상. 케이스 포함.',
      price: 950000,
      category: '전자기기',
      location: '서울 마포구',
      sellerId: user1.id,
    },
    {
      title: '나이키 에어맥스 270',
      description: '270mm, 3번 착용. 박스 있음.',
      price: 65000,
      category: '의류/잡화',
      location: '서울 마포구',
      sellerId: user1.id,
    },
    {
      title: '책상 + 의자 세트',
      description: '이사로 인한 급처. 직거래만.',
      price: 120000,
      category: '가구/인테리어',
      location: '서울 강남구',
      sellerId: user2.id,
    },
  ];

  for (const p of seedProducts) {
    await prisma.product.create({ data: { ...p, images: '[]' } });
  }

  console.log('Seed 완료!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
