import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform hover:shadow-2xl transition-all duration-300 ease-in-out hover:scale-105">
      <Link to={`/product/${product.id}`} className="relative group">
        <img
          src={product.image}
          alt={product.title}
          className="w-full object-contain h-48 transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black group-hover:scale-110 transition-all bg-opacity-25 opacity-0 group-hover:opacity-100 duration-300 flex items-center justify-center">
          <p className="text-white text-lg font-semibold">View Details</p>
        </div>
      </Link>
      <div className="p-6 flex flex-col h-full">
        <h2 className="text-lg font-semibold line-clamp-2 mt-2 text-gray-900">
          {product.title}
        </h2>
        <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
        <div className="flex flex-col flex-1 justify-end mt-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">
              ${`${product.price}`.split(".")[0]}
              <span className="text-gray-500 text-sm">
                .{`${product.price}`.split(".")[1]}
              </span>
            </span>
            <button
              onClick={() => onAddToCart(product)}
              className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-700 hover:to-green-700 text-white font-medium py-3 px-3 rounded-md flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Icon icon="mingcute:shopping-bag-1-line" className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
