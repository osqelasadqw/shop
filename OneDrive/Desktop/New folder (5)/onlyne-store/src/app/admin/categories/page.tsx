'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firebase-service';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      const newCategory = await createCategory(newCategoryName);
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim() || editingName === categories.find(c => c.id === id)?.name) {
      setEditingId(null);
      return;
    }
    
    try {
      setIsSubmitting(true);
      const updatedCategory = await updateCategory(id, editingName);
      setCategories(categories.map(category => 
        category.id === id ? updatedCategory : category
      ));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('ნამდვილად გსურთ კატეგორიის წაშლა? ამ კატეგორიასთან დაკავშირებული პროდუქტები დარჩება, მაგრამ კატეგორიის გარეშე.')) {
      try {
        setIsSubmitting(true);
        await deleteCategory(id);
        setCategories(categories.filter(category => category.id !== id));
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">კატეგორიების მართვა</h1>
            <p className="text-muted-foreground mt-1">
              ორგანიზება გაუკეთეთ თქვენს პროდუქტებს კატეგორიების დამატებით
            </p>
          </div>
          <Button
            onClick={() => setIsAdding(true)}
            className="mt-4 sm:mt-0"
            disabled={isAdding}
          >
            <Plus className="mr-2 h-4 w-4" />
            კატეგორიის დამატება
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isAdding && (
            <div className="p-4 border-b bg-gray-50">
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="new-category" className="sr-only">
                    ახალი კატეგორია
                  </Label>
                  <Input
                    id="new-category"
                    placeholder="შეიყვანეთ კატეგორიის სახელი"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={!newCategoryName.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'მიმდინარეობს...' : 'დამატება'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    გაუქმება
                  </Button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-2 text-muted-foreground">მიმდინარეობს ჩატვირთვა...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">კატეგორიები არ არის დამატებული.</p>
              <Button
                onClick={() => setIsAdding(true)}
                variant="link"
                className="mt-2"
              >
                დაამატეთ პირველი კატეგორია
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {categories.map((category) => (
                <li key={category.id} className="p-4 hover:bg-gray-50">
                  {editingId === category.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                        disabled={isSubmitting}
                        autoFocus
                      />
                      <Button
                        size="icon"
                        onClick={() => handleUpdateCategory(category.id)}
                        disabled={isSubmitting || !editingName.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => startEditing(category)}
                          disabled={isSubmitting}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 