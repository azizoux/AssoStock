"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/type";
import { listCategory } from "../actions";

const page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
  });
  const loadCategories = async () => {
    if (email) {
      const data = await listCategory(email);
      if (data) setCategories(data);
    }
  };
  useEffect(() => {
    loadCategories();
  }, [email]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  return (
    <Wrapper>
      <div className="flex justify-center items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Creer un Produit</h1>
          <section className="flex md:flex-row flex-col">
            <div className="space-y-4 md:w-[450px]">
              <input
                type="text"
                name="name"
                placeholder="Nom"
                className="input  input-bordered w-full"
                value={formData.name}
                onChange={handleChange}
              />
              <textarea
                name="description"
                placeholder="description"
                className="textarea textarea-bordered w-full"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
              <input
                type="number"
                name="price"
                placeholder="Prix"
                className="input  input-bordered w-full"
                value={formData.price}
                onChange={handleChange}
              />
              <select
                className="select select-bordered w-full"
                name=""
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option disabled>Choisir une categorie:</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
