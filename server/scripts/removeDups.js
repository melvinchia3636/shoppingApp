const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findDuplicateProductTitles() {
  const results = await prisma.$queryRaw`
    SELECT title, COUNT(*) as count
    FROM Product
    GROUP BY title
    HAVING COUNT(*) > 1;
  `;
  return results;
}

async function deleteDuplicateProducts(titles) {
  for (const title of titles) {
    const products = await prisma.product.findMany({
      where: { title },
      orderBy: { id: "asc" }, // Sort by ID to keep the oldest
    });

    if (products.length > 1) {
      const productsToDelete = products.slice(1); // Keep the first, delete the rest
      await prisma.product.deleteMany({
        where: { id: { in: productsToDelete.map((p) => p.id) } },
      });
    }
  }
}

findDuplicateProductTitles()
  .then((duplicateTitles) =>
    deleteDuplicateProducts(duplicateTitles.map((item) => item.title))
  )
  .catch((error) => console.error("Error handling duplicates:", error));
