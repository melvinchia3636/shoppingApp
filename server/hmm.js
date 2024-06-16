const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    if (product.price === 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: Number((Math.random() * 10).toFixed(2)) },
      });
    }
  }
}

main();
