import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Product } from "../../types";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ProductDetailProps {
  onAddToCart: (product: Product) => void;
}

function ProductDetail({ onAddToCart }: ProductDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${id}`);
        const data: Product = await response.json();
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-teal-500"></div>
        <span className="ml-2 text-teal-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-28 p-4 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 flex items-center rounded-md shadow-sm transition-all duration-200"
      >
        <Icon icon="uil:arrow-left" className="w-5 h-5 mr-2" />
        Back
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white p-8 rounded-md shadow-lg">
        <div>
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-64 sm:h-96 object-cover rounded-md transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">
              {product.title}
            </h1>
            <p className="text-gray-700 mb-4">{product.description}</p>
            <p className="text-2xl font-semibold text-teal-600 mb-6">
              ${product.price}
            </p>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="bg-gradient-to-r justify-center from-teal-500 to-green-500 hover:from-teal-700 hover:to-green-700 text-white font-medium py-4 px-5 rounded-md flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Icon icon="mingcute:shopping-bag-1-line" className="w-5 h-5" />
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
