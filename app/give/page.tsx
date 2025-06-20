"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { OrderItem, Product } from "@/type";
import { deductStockWithTransaction, listProducts } from "../actions";
import ProductComponent from "../components/ProductComponent";
import EmptyState from "../components/EmptyState";
import ProductImage from "../components/ProductImage";
import { Trash } from "lucide-react";
import { toast } from "react-toastify";

const page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const fetchProducts = async () => {
    try {
      if (email) {
        const products = await listProducts(email);
        if (products) {
          setProducts(products);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (email) {
      fetchProducts();
    }
  }, [email]);
  const filteredAvailableProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLocaleLowerCase())
    )
    .filter((product) => !selectedProductIds.includes(product.id))
    .slice(0, 10);
  const handleAddToCart = (product: Product) => {
    setOrder((prevOrder) => {
      let updatedOrder;
      const existingProduct = prevOrder.find(
        (item) => item.productId === product.id
      );
      if (existingProduct) {
        updatedOrder = prevOrder.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.quantity),
              }
            : item
        );
      } else {
        updatedOrder = [
          ...prevOrder,
          {
            productId: product.id,
            quantity: 1,
            unit: product.unit,
            imageUrl: product.imageUrl,
            name: product.name,
            availableQuantity: product.quantity,
          },
        ];
      }
      setSelectedProductIds((prevSelected) =>
        prevSelected.includes(product.id)
          ? prevSelected
          : [...prevSelected, product.id]
      );
      return updatedOrder;
    });
  };
  const handleQuantityChange = (productId: string, quantity: number) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };
  const handleRemoveFromCart = (productId: string) => {
    setOrder((prevOrder) =>
      prevOrder.filter((item) => item.productId !== productId)
    );
    setSelectedProductIds((prevSelectedProductIds) =>
      prevSelectedProductIds.filter((id) => id !== productId)
    );
  };
  const handleSubmit = async () => {
    try {
      if (order.length == 0) {
        toast.error("Veuillez ajouter des produits a la commande.");
      }
      const response = await deductStockWithTransaction(order, email);
      if (response?.success) {
        toast.success("Don confirmé avec succès!");
        setOrder([]);
        setSelectedProductIds([]);
        fetchProducts();
      } else {
        toast.error(`${response?.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <Wrapper>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="md:w-1/3">
          <input
            type="text"
            placeholder="Rechercher un produi..."
            className="input input-bordered w-full mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-y-4">
            {filteredAvailableProducts.length > 0 ? (
              filteredAvailableProducts.map((product, index) => (
                <ProductComponent
                  key={index}
                  product={product}
                  add={true}
                  handleAddToCart={handleAddToCart}
                />
              ))
            ) : (
              <EmptyState
                message="Aucun produit disponible"
                IconComponent="PackageSearch"
              />
            )}
          </div>
        </div>
        <div className="md:w-2/3 p-4 md:ml-4 md:mb-0 h-fit border-2 border-base-200 rounded-3xl overflow-x-auto">
          {order.length > 0 ? (
            <div>
              <table className="table w-full scroll-auto">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Unité</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {order.map((item) => (
                    <tr key={item.productId}>
                      <td>
                        <ProductImage
                          src={item.imageUrl}
                          alt={item.imageUrl}
                          heightClass="h-12"
                          widthClass="w-12"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          min={"1"}
                          max={item.availableQuantity}
                          className="input input-bordered w-20"
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productId,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="capitalize">{item.unit}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => handleRemoveFromCart(item.productId)}
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="btn btn-primary mt-4 w-fit"
                onClick={handleSubmit}
              >
                Confirmer le Don
              </button>
            </div>
          ) : (
            <EmptyState
              message="Aucun produit dans le panier"
              IconComponent="HandHeart"
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
