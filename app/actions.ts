"use server";

import prisma from "@/lib/prisma";
import { FormDataType, Product } from "@/type";
import { Category } from "@prisma/client";

export async function checkAndAddAssociation(email: string, name: string) {
  if (!email) return;
  try {
    const existingAssociation = await prisma.association.findUnique({
      where: {
        email,
      },
    });
    if (!existingAssociation && email) {
      await prisma.association.create({
        data: {
          email,
          name,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

export async function getAssociation(email: string) {
  if (!email) return;
  try {
    const existingAssociation = await prisma.association.findUnique({
      where: {
        email,
      },
    });

    return existingAssociation;
  } catch (error) {
    console.error(error);
  }
}

export async function createCategory(
  name: string,
  email: string,
  description?: string
) {
  if (!name) return;
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.category.create({
      data: {
        name,
        description: description || "",
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateCategory(
  id: string,
  name: string,
  email: string,
  description?: string
) {
  if (!id || !email || !name) {
    throw new Error("Invalid category to update");
  }
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.category.update({
      where: {
        id: id,
        associationId: association.id,
      },
      data: {
        name,
        description: description || "",
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteCategory(id: string, email: string) {
  if (!id || !email) {
    throw new Error("Invalid category to delete");
  }
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.category.delete({
      where: {
        id: id,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function listCategory(
  email: string
): Promise<Category[] | undefined> {
  if (!email) {
    throw new Error("Association's email is required");
  }
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    const categories = await prisma.category.findMany({
      where: {
        associationId: association.id,
      },
    });
    return categories;
  } catch (error) {
    console.error(error);
  }
}

export async function createProduct(formData: FormDataType, email: string) {
  try {
    const { name, description, price, imageUrl, categoryId, unit } = formData;
    if (!email || !price || !categoryId) {
      throw new Error(
        "Le nom, le prix, la categorie et l'email sont requise pour la creation de produit"
      );
    }
    const safeImageUrl = imageUrl || "";
    const safeUnit = unit || "";
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl: safeImageUrl,
        categoryId,
        unit: safeUnit,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function updateProduct(formData: FormDataType, email: string) {
  try {
    const { id, name, description, price, imageUrl } = formData;
    if (!id || !email || !price) {
      throw new Error("Le nom, le prix, la categorie et l'email sont requises");
    }
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.product.update({
      where: {
        id,
        associationId: association.id,
      },
      data: {
        name,
        description,
        price,
        imageUrl,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function deleteProduct(id: string, email: string) {
  try {
    if (!id) {
      throw new Error("l'id du produit est requis pour la suppression");
    }
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    await prisma.product.delete({
      where: {
        id,
        associationId: association.id,
      },
    });
  } catch (error) {
    console.error(error);
  }
}

export async function listProducts(
  email: string
): Promise<Product[] | undefined> {
  if (!email) {
    throw new Error("Association's email is required");
  }
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    const products = await prisma.product.findMany({
      where: {
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });
    return products.map((product) => ({
      ...product,
      categoryName: product.category?.name,
    }));
  } catch (error) {
    console.error(error);
  }
}

export async function getProductById(
  productId: string,
  email: string
): Promise<Product | undefined> {
  if (!email) {
    throw new Error("Association's email is required");
  }
  try {
    const association = await getAssociation(email);
    if (!association) {
      throw new Error("Association not found 404");
    }
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        associationId: association.id,
      },
      include: {
        category: true,
      },
    });
    if (!product) {
      return undefined;
    }
    return {
      ...product,
      categoryName: product.category?.name,
    };
  } catch (error) {
    console.error(error);
  }
}
