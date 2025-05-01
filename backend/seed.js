const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const customer = await prisma.customer.create({
    data: {
      phone: '88888888',
      idNumber: '1-2345-6789',
      name: 'Luis Tester'
    }
  });

  console.log('Cliente creado:', customer);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });