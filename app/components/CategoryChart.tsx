import { ChartData } from "@/type";
import React, { useEffect, useState } from "react";
import { getProductCategoryDistribution } from "../actions";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "./EmptyState";

const CategoryChart = ({ email }: { email: string }) => {
  const [data, setData] = useState<ChartData[]>([]);
  const COLORS = {
    default: "#F1D2BF",
  };
  const fetchStats = async () => {
    try {
      if (email) {
        const result = await getProductCategoryDistribution(email);
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
      fetchStats();
    }
  }, [email]);
  const renderCharts = (widthOverRide?: string) => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        }}
        barCategoryGap={widthOverRide ? 0 : "10"}
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 15,
            fill: "#793205",
            fontWeight: "bold",
          }}
        />
        <YAxis hide />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={200}>
          <LabelList
            fill="#8884d8"
            dataKey="value"
            position="insideRight"
            style={{
              fontSize: "20px",
              fontWeight: "bold",
            }}
          />
          {data.map((entry, index) => (
            <Cell
              key={`cell=${index}`}
              cursor="default"
              fill={COLORS.default}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  if (data.length == 0) {
    return (
      <div className="w-full border-2 border-base-200 rounded-3xl p-4 mt-4">
        <h2 className="text-xl font-bold mb-4">
          5 categories avec les plus des produits
        </h2>
        <EmptyState
          message="Aucune category pour le moment"
          IconComponent="Group"
        />
      </div>
    );
  }
  return (
    <div className="w-full border-2 border-base-200 rounded-3xl p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">
        5 categories avec les plus des produits
      </h2>
      {renderCharts()}
    </div>
  );
};

export default CategoryChart;
