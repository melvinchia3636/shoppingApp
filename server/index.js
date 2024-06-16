require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateUser = require("./authUserMiddleware");

async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

const app = express();
app.use(cors());
app.use(express.json());
const prisma = new PrismaClient();

app.get("/products", async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    const pageSize = 25;
    const searchTerm = req.query.search || "";

    page = isNaN(page) || page < 1 ? 1 : page;

    const skip = (page - 1) * pageSize;
    const products = await prisma.product.findMany({
      skip,
      take: pageSize,
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
      },
    });

    let totalProducts;

    if (searchTerm) {
      totalProducts = await prisma.product.count({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
          ],
        },
      });
    } else {
      totalProducts = await prisma.product.count();
    }

    const totalPages = Math.ceil(totalProducts / pageSize);

    res.json({ products, totalPages });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
});

app.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (error, user) => {
      if (error) {
        return res.status(403).json({ error: "Invalid token" });
      }
      res.json({ user });
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({ data: { username, passwordHash } });

  const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// /login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.get("/cart", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    res.json(
      cartItems.map((item) => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
      }))
    );
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try again later." });
  }
});

app.post("/cart", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (
      !productId ||
      isNaN(productId) ||
      quantity <= 0 ||
      !Number.isInteger(quantity)
    ) {
      return res.status(400).json({ error: "Invalid product or quantity" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (cartItem) {
      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity: cartItem.quantity + quantity },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: { userId, productId, quantity },
      });
    }

    res.status(201).json({
      id: cartItem.id,
      product,
      quantity: cartItem.quantity,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/cart/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(cartItemId) || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid cart item ID or quantity" });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    res.json({ message: "Cart item updated" });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/cart/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = parseInt(req.params.id);

    if (isNaN(cartItemId)) {
      return res.status(400).json({ error: "Invalid cart item ID" });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await prisma.cartItem.delete({ where: { id: cartItemId } });
    res.json({ message: "Cart item deleted" });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/orders", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderItems, shippingAddress, email } = req.body;

    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ error: "Invalid order items" });
    }
    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email
    ) {
      return res.status(400).json({ error: "Invalid shipping address" });
    }

    const total = await calculateOrderTotal(orderItems);

    const order = await prisma.order.create({
      data: {
        userId,
        email,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        status: "PENDING",
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { orderItems: true },
    });

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        id: { in: orderItems.map((item) => item.id) },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET ORDERS FOR USER
app.get("/orders", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      orderBy: { id: "desc" },
      where: { userId },
      include: { orderItems: { include: { product: true } } },
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/orders/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "PENDING") {
      return res.status(400).json({ error: "Cannot cancel order" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    res.json({ message: "Order cancelled" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Function to calculate the total price of an order
async function calculateOrderTotal(orderItems) {
  let total = 0;
  for (const cartItem of orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: cartItem.productId },
    });

    if (!product) {
      throw new Error(`Product with ID ${cartItem.productId} not found.`);
    }

    total += product.price * cartItem.quantity;
  }
  return total;
}

app.post("/seed", async (req, res) => {
  const { products } = req.body;

  const currentCat = "Mirrorless Cameras";

  if (!products || !Array.isArray(products)) {
    return res.status(400).json({ error: "Invalid products data" });
  }

  let category = await prisma.category.findFirst({
    where: { name: currentCat },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name: currentCat },
    });
  }

  try {
    for (const product of products) {
      if (!product.price) {
        product.price = 0;
      }

      await prisma.product.create({
        data: {
          ...product,
          category: { connect: { id: category.id } },
          description: "",
        },
      });
    }

    res.json({ message: "Products seeded successfully" });
  } catch (error) {
    console.error("Error seeding products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
