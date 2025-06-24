import { StockSummary } from "@/type";
import React, { useEffect, useState } from "react";
import { getStockSummary } from "../actions";
import ProductImage from "./ProductImage";
import EmptyState from "./EmptyState";

const StockSummaryTable = ({ email }: { email: string }) => {
  const [data, setData] = useState<StockSummary | null>(null);

  const fetchSummary = async () => {
    try {
      if (email) {
        const result = await getStockSummary(email);
        if (result) {
          setData(result);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (email) {
      fetchSummary();
    }
  }, [email]);
  if (!data) {
    <div className="felx justify-center items-center w-full">
      <span className="loading loading-spinner loading-xl"></span>
    </div>;
  } else {
    return (
      <div className="w-full">
        <ul className="steps steps-vertical w-full rounded-3xl p-4 border-2 border-base-200">
          <li className="step step-primary">
            <div>
              <span className="text-sm mr-4 font-bold">Stock normal</span>
              <div className="badge badge-soft badge-success font-bold">
                {data?.inStockCount}
              </div>
            </div>
          </li>
          <li className="step step-primary">
            <div>
              <span className="text-sm mr-4 font-bold">{`Stock faible (<=5)`}</span>
              <div className="badge badge-soft badge-warning font-bold">
                {data?.lowStockCount}
              </div>
            </div>
          </li>
          <li className="step step-primary">
            <div>
              <span className="text-sm mr-4 font-bold">Rupture</span>
              <div className="badge badge-soft badge-error font-bold">
                {data?.outOfStockCount}
              </div>
            </div>
          </li>
        </ul>
        <div className="border-2 border-base-200 rounded-3xl w-full mt-4 p-4">
          <h2 className="font-bold text-xl mb-4">Produits critiques</h2>
          {data.criticalProducts.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Image</th>
                  <th>Nom</th>
                  <th>Quantité</th>
                </tr>
              </thead>
              <tbody>
                {data.criticalProducts.map((product, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <td>
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.imageUrl}
                        heightClass="h-12"
                        widthClass="w-12"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td className="capitalize">
                      {product.quantity} {product.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>
              <EmptyState
                message="Aucun produit critique"
                IconComponent="PackageSearch"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default StockSummaryTable;
