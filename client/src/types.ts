// types.ts

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  orderDate: string;
  total: number;
  status: string;
  orderItems: {
    quantity: number;
    product: {
      id: number;
      title: string;
      price: number;
      image: string; // Assuming you have product images
    };
  }[];
}
