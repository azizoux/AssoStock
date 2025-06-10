"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import { useUser } from "@clerk/nextjs";
import { Category } from "@prisma/client";
import { FormDataType } from "@/type";
import { createProduct, listCategory } from "../actions";
import { FileImage } from "lucide-react";
import ProductImage from "../components/ProductImage";
import { toast } from "react-toastify";
import { log } from "console";
import { useRouter } from "next/navigation";

const page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    unit: "",
    imageUrl: "",
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
  const handleSubmit = async () => {
    if (!file) {
      toast.error("Veuillez selectionner une image");
      return;
    }
    try {
      const imageData = new FormData();
      imageData.append("file", file);
      const res = await fetch("api/upload", {
        method: "POST",
        body: imageData,
      });
      const data = await res.json();
      if (!data.success) {
        throw Error("Upload image error");
      } else {
        formData.imageUrl = data.path;
        formData.price = Number(formData.price);
        await createProduct(formData, email);
        toast.success("Produit créé avec succès");
        router.push("/products");
      }
    } catch (error) {
      console.log(error);
      toast.error("Il y'a une erreur");
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
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
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Choisir une categorie:</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="">Selectionner l'unité:</option>
                <option value="g">Gramme</option>
                <option value="kg">Kilogramme</option>
                <option value="l">Litre</option>
                <option value="m">Metre</option>
                <option value="cm">Centimetre</option>
                <option value="h">Heure</option>
                <option value="pcs">Piéces</option>
              </select>
              <input
                type="file"
                accept="image/*"
                placeholder="Image"
                className="file-input  file-input-bordered w-full"
                onChange={handleFileChange}
              />
              <button onClick={handleSubmit} className="btn btn-primary">
                Creer le produit
              </button>
            </div>
            <div className="md:ml-4 md:w-[300px] mt-4 md:mt-0 border-2 border-primary md:h-[300px] p-5 flex justify-center items-center rounded-3xl">
              {previewUrl && previewUrl !== "" ? (
                <div>
                  <ProductImage
                    src={previewUrl}
                    alt="preview"
                    heightClass="h-40"
                    widthClass="w-40"
                  />
                </div>
              ) : (
                <div className="wiggle-animation">
                  <FileImage
                    strokeWidth={1}
                    className="h-10 w-10 text-primary"
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Wrapper>
  );
};

export default page;
