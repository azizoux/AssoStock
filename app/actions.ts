"use server";

import prisma from "@/lib/prisma";
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
