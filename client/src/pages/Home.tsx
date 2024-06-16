import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import ProductCard from "../components/products/ProductCard";
import { Product } from "../types";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "@uidotdev/usehooks";

interface ProductListProps {
  onAddToCart: (product: Product) => void;
}

function Home({ onAddToCart }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const renderPageNumbers = () => {
    const pageNumbers: JSX.Element[] = [];
    const pagesToShow = 5;

    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    if (startPage > 1) {
      if (startPage > 2) {
        pageNumbers.push(
          <>
            <button
              key={1}
              onClick={() => handlePageChange(1)}
              className={`px-3 py-2 rounded-md  ${
                currentPage === 1
                  ? "bg-teal-500 text-white"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
            >
              {1}
            </button>
            <Icon icon="uil:ellipsis-h" className="text-gray-500" />
          </>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-5 py-3 rounded-md  ${
            currentPage === i
              ? "bg-teal-500 text-white"
              : "text-gray-500 hover:bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      pageNumbers.push(
        <>
          {endPage < totalPages && (
            <Icon icon="uil:ellipsis-h" className="text-gray-500" />
          )}
          <button
            key={totalPages}
            onClick={() => handlePageChange(totalPages)}
            className={`px-5 py-3 rounded-md  ${
              currentPage === totalPages
                ? "bg-teal-500 text-white"
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            {totalPages}
          </button>
        </>
      );
    }

    return pageNumbers;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/products?page=${currentPage}&search=${debouncedSearchTerm}`
        );
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, debouncedSearchTerm]);

  return (
    <div className="w-full min-h-dvh flex flex-col mx-auto">
      {isLoading ? (
        <div className="w-full h-full flex-1 flex items-center justify-center flex-col gap-4">
          <Icon
            icon="svg-spinners:180-ring"
            className="w-12 h-12 text-teal-500"
          />
          <div className="text-2xl">Loading ...</div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-semibold mt-28 px-8">
            Welcome to this amazing shop!
          </h1>
          <p className="text-gray-600 mt-2 px-8">
            69% of this project is done by using the power of AI.
          </p>
          <search className="flex items-center gap-2 mt-8 px-4 py-2 border-2 mx-8 border-gray-200 rounded-md ">
            <Icon icon="uil:search" className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full p-2 rounded-md  focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </search>
          <div className="grid grid-cols-1 [@media(min-width:450px)]:grid-cols-2 mt-8 md:!grid-cols-3 lg:!grid-cols-4 xl:!grid-cols-5 gap-4 p-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
          <div className="justify-between flex items-center gap-2 mt-4 mb-12 px-8">
            {currentPage > 1 ? (
              <button
                key="first"
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-3 py-4 flex items-center gap-2 w-32 justify-center rounded-md  text-gray-500 hover:bg-gray-200"
              >
                <Icon icon="uil:angle-left" className="w-5 h-5" />
                Previous
              </button>
            ) : (
              <span className="w-32"></span>
            )}
            <div className="flex gap-2 items-center">{renderPageNumbers()}</div>
            {currentPage < totalPages ? (
              <button
                key="last"
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-3 py-4 w-32 flex items-center justify-center gap-2 rounded-md  text-gray-500 hover:bg-gray-200"
              >
                Next
                <Icon icon="uil:angle-right" className="w-5 h-5" />
              </button>
            ) : (
              <span className="w-32"></span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
