"use client";

import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import CategoryModal from "../components/CategoryModal";
import { useUser } from "@clerk/nextjs";
import {
  createCategory,
  deleteCategory,
  listCategory,
  updateCategory,
} from "../actions";
import { toast } from "react-toastify";
import { Category } from "@prisma/client";
import EmptyState from "../components/EmptyState";
import { Pencil, Trash } from "lucide-react";

const page = () => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const openCreateModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };
  const loadCategories = async () => {
    if (email) {
      const data = await listCategory(email);
      if (data) setCategories(data);
    }
  };
  useEffect(() => {
    loadCategories();
  }, [email]);
  const closeModal = () => {
    setName("");
    setDescription("");
    setEditMode(false);
    (document.getElementById("category_modal") as HTMLDialogElement)?.close();
  };
  const handleCreateCategory = async () => {
    setLoading(true);
    if (email) {
      await createCategory(name, email, description);
    }
    closeModal();
    setLoading(false);
    await loadCategories();
    toast.success("Categorie créée avec succès!");
  };
  const handleUpdateCategory = async () => {
    setLoading(true);
    if (email && editingCategoryId) {
      await updateCategory(editingCategoryId, name, email, description);
    }
    closeModal();
    setLoading(false);
    await loadCategories();
    toast.success("Categorie modifiée avec succès!");
  };
  const openEditModal = (category: Category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description || " ");
    setEditMode(true);
    (
      document.getElementById("category_modal") as HTMLDialogElement
    )?.showModal();
  };
  const handleDeleteCategory = async (categoryId: string) => {
    const confirmDelete = confirm(
      "Voulez-vous vraiment supprimer cette categorie ?"
    );
    if (!confirmDelete) return;
    await deleteCategory(categoryId, email);
    await loadCategories();
    toast.success("Categorie supprimée avec succès!");
  };
  return (
    <Wrapper>
      <div>
        <div className="mb-4">
          <button className="btn btn-primary" onClick={openCreateModal}>
            Ajouter une catégorie
          </button>
        </div>
        {categories.length > 0 ? (
          <div>
            {categories.map((category) => (
              <div
                key={category.id}
                className="mb-2 p-5 border-2 border-base-200 rounded-3xl flex justify-between items-center"
              >
                <div>
                  <strong className="text-lg">{category.name}</strong>
                  <div className="text-sm">{category.description}</div>
                </div>
                <div className="flex  gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => openEditModal(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wiggle-animation">
            <EmptyState
              message="Aucune categorie disponible"
              IconComponent="Group"
            />
          </div>
        )}
      </div>
      <CategoryModal
        name={name}
        description={description}
        loading={loading}
        onChangeName={setName}
        onChangeDescription={setDescription}
        editMode={editMode}
        onClose={closeModal}
        onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}
      />
    </Wrapper>
  );
};

export default page;
