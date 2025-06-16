"use client";
import { createProduct, getProductById, updateProduct } from "@/app/actions";
import ProductImage from "@/app/components/ProductImage";
import Wrapper from "@/app/components/Wrapper";
import { FormDataType, Product } from "@/type";
import { useUser } from "@clerk/nextjs";
import { FileImage } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const page = ({ params }: { params: Promise<{ productId: string }> }) => {
  const { user } = useUser();
  const router = useRouter();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    name: "",
    description: "",
    price: 0,
    categoryName: "",
    imageUrl: "",
  });
  const fetchProduct = async () => {
    try {
      const { productId } = await params;
      if (email) {
        const fetchedProduct = await getProductById(productId, email);

        if (fetchedProduct) {
          setProduct(fetchedProduct);
          setFormData({
            id: fetchedProduct.id,
            name: fetchedProduct.name,
            description: fetchedProduct.description,
            price: fetchedProduct.price,
            categoryName: fetchedProduct.categoryName,
            imageUrl: fetchedProduct.imageUrl,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleInputChange = (
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [email]);
  const handleSubmit = async (e: React.FormEvent) => {
    let imageUrl = formData?.imageUrl;
    e.preventDefault();
    try {
      if (file) {
        const resDelete = await fetch("/api/upload", {
          method: "DELETE",
          body: JSON.stringify({ path: formData.imageUrl }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const dataDelete = await resDelete.json();
        if (!dataDelete.success) {
          throw new Error("Echec suppression de l'image " + dataDelete.message);
        }
        const imageData = new FormData();
        imageData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        const data = await res.json();

        if (!data.success) {
          throw Error("Uploading image error");
        }
        imageUrl = data.path;
        formData.imageUrl = imageUrl;
        formData.price = Number(formData.price);
        await updateProduct(formData, email);
        toast.success("Produit mis a jour");
        router.push("/products");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };
  return (
    <Wrapper>
      <div>
        {product ? (
          <div>
            <h1 className="text-2xl font-bold mb-4">Mise a jour du produit</h1>
            <div className="flex flex-col md:flex-row md:items-center">
              <form className="space-y-2" onSubmit={handleSubmit}>
                <div className="text-sm font-semibold mb-2">Nom</div>
                <input
                  type="text"
                  name="name"
                  placeholder="Nom"
                  className="input  input-bordered w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <div className="text-sm font-semibold mb-2">Description</div>
                <textarea
                  name="description"
                  placeholder="description"
                  className="textarea textarea-bordered w-full"
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>

                <div className="text-sm font-semibold mb-2">Categorie</div>
                <input
                  type="text"
                  name="Categorie"
                  className="input  input-bordered w-full"
                  value={formData.categoryName}
                  disabled
                />
                <div className="text-sm font-semibold mb-2">
                  Image / Prix Unitaire
                </div>
                <div className="flex">
                  <input
                    type="file"
                    accept="image/*"
                    placeholder="Image"
                    className="file-input  file-input-bordered w-full"
                    onChange={handleFileChange}
                  />
                  <input
                    type="text"
                    name="Prix"
                    placeholder="Prix"
                    className="input  input-bordered w-full ml-4"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-3">
                  Mettre a jour
                </button>
              </form>

              <div className="flex md:flex-col md:ml-4 mt-4 md:mt-0">
                <div className="md:ml-4 md:w-[200px] mt-4 md:mt-0 border-2 border-primary md:h-[200px] p-5  justify-center items-center rounded-3xl hidden md:flex">
                  {formData.imageUrl && formData.imageUrl !== "" ? (
                    <div>
                      <ProductImage
                        src={formData.imageUrl}
                        alt={product.name}
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
                <div className="md:ml-4 md:w-[200px] w-full md:mt-4  border-2 border-primary md:h-[200px] p-5 flex justify-center items-center rounded-3xl">
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
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full">
            <span className="loading loading-spinner loading-xl"></span>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default page;
