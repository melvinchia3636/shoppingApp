require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const Groq = require("groq-sdk");
const { PrismaClient } = require("@prisma/client");
const inquirer = require("inquirer");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const prisma = new PrismaClient();

async function getGroqChatCompletion(item) {
  const template = Object.fromEntries(
    item.map((product) => [product.id, product.title])
  );

  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Given these product in a javascript object: ${JSON.stringify(
          template
        )}. Generate a detailed description for each of the product, as detailed as possible. Each description should be longer than 50 words, but do not mention the product titles in the generated description. Return an object with the key being the product id and the value being the descriptions of the respective product title. Output only the object without any additional information. Do not write text like "Here is the output" before the result. The output should be a valid javascript object that can be parsed straight into a javascript object. Do not forget to include the closing curly brace.`,
      },
    ],
    model: "llama3-8b-8192",
  });
}

async function main() {
  const products = await prisma.product.findMany();

  const withoutDescription = products.filter((product) => !product.description);

  const splitIntoGroupOfTen = (arr) => {
    const groups = [];
    for (let i = 0; i < arr.length; i += 25) {
      groups.push(arr.slice(i, i + 25));
    }
    return groups;
  };

  const groups = splitIntoGroupOfTen(withoutDescription);

  let result;

  for (const productGroup of groups) {
    let ok = false;
    while (!ok) {
      const chatCompletion = await getGroqChatCompletion(productGroup);
      result = chatCompletion.choices[0]?.message?.content;

      if (!result.endsWith("}")) {
        result += "}";
      }

      try {
        const descriptions = JSON.parse(result);

        for (const product of productGroup) {
          const description = descriptions[product.id];
          await prisma.product.update({
            where: { id: product.id },
            data: { description },
          });

          console.log(`Updated product ${product.id} description`);
        }
        ok = true;
      } catch (error) {
        console.error("Error updating product descriptions");
      }
    }
  }
}

main();
