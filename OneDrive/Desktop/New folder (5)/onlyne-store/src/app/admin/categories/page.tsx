'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts, updateProduct } from '@/lib/firebase-service';
import { Category, Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, X, Check, ArrowLeftRight, Image as ImageIcon, Grid, Save } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

type DragItemType = {
  id: string;
  type: string;
  image: string;
  productId: string;
};

// Wrapper component to work around the ref type issue
const DragRef = ({ children, innerRef }: { children: React.ReactNode; innerRef: any }) => {
  return <div ref={innerRef}>{children}</div>;
};

const DraggableImage = ({ image, productId }: { image: string; productId: string }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: { id: crypto.randomUUID(), type: 'image', image, productId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    end: (item, monitor) => {
      // Fade out animation finished
    }
  }));

  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null; // არ გამოაჩინო დივი, თუ სურათი ვერ ჩაიტვირთა
  }

  return (
    <DragRef innerRef={drag}>
      <div
        className={`relative aspect-square rounded overflow-hidden shadow-sm hover:shadow-md transition-all ${
          isDragging ? 'opacity-30 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          cursor: 'grab',
          maxWidth: '120px',
          maxHeight: '120px',
          transform: isDragging ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.2s ease'
        }}
      >
        <img
          src={image}
          alt="პროდუქტის ფოტო"
          className="h-full w-full object-contain"
          onError={() => setImageError(true)}
        />
      </div>
    </DragRef>
  );
};

const CategoryDropZone = ({ category, onImageDrop, pendingImages }: { 
  category: Category, 
  onImageDrop: (imageData: DragItemType, categoryId: string) => void,
  pendingImages: {id: string, image: string}[]
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'image',
    drop: (item: DragItemType) => {
      onImageDrop(item, category.id);
      return { success: true };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }));

  return (
    <DragRef innerRef={drop}>
      <div
        className={`p-4 border-2 rounded-md min-h-[120px] transition-all duration-200 ${
          isOver && canDrop 
            ? 'border-primary bg-primary/10 shadow-md scale-102' 
            : 'border-dashed border-gray-300'
        }`}
        style={{
          transform: isOver && canDrop ? 'scale(1.02)' : 'scale(1)'
        }}
      >
        <h3 className="font-medium mb-2">{category.name}</h3>
        {pendingImages.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            გადმოიტანეთ ფოტოები აქ კატეგორიაში დასამატებლად
          </div>
        ) : (
          <div className="mt-2">
            <div className="grid grid-cols-3 gap-2">
              {pendingImages.map((img) => (
                <div 
                  key={img.id} 
                  className="aspect-square rounded overflow-hidden shadow-sm"
                  style={{ maxWidth: '60px', maxHeight: '60px' }}
                >
                  <img 
                    src={img.image} 
                    alt="კატეგორიის ფოტო" 
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isOver && canDrop && (
          <div className="mt-2 text-xs text-primary animate-pulse">
            აქ გადმოაგდეთ
          </div>
        )}
      </div>
    </DragRef>
  );
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [allImages, setAllImages] = useState<{id: string, image: string, productId: string}[]>([]);
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{imageId: string, productId: string, categoryId: string}[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryImages, setCategoryImages] = useState<Record<string, {id: string, image: string}[]>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isDistributionModalOpen) {
      fetchProducts();
      // Reset pending changes when modal opens
      setPendingChanges([]);
      setCategoryImages({});
    }
  }, [isDistributionModalOpen]);

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

  const fetchProducts = async () => {
    try {
      const productsData = await getProducts();
      setProducts(productsData);
      
      // Extract all images from all products
      const images = productsData.flatMap(product => 
        (product.images || [])
          .filter(image => !!image && typeof image === 'string' && image.trim() !== '')
          .map(image => ({ 
            id: crypto.randomUUID(), 
            image, 
            productId: product.id 
          }))
      );
      
      setAllImages(images);
    } catch (error) {
      console.error('Error fetching products:', error);
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

  const handleImageDrop = (imageData: DragItemType, categoryId: string) => {
    try {
      // Store pending change
      setPendingChanges([
        ...pendingChanges, 
        { 
          imageId: imageData.id, 
          productId: imageData.productId, 
          categoryId 
        }
      ]);
      
      // Move image from allImages to categoryImages
      setAllImages(prevImages => 
        prevImages.filter(img => img.id !== imageData.id)
      );
      
      // Add image to category
      setCategoryImages(prev => {
        const newCategoryImages = { ...prev };
        if (!newCategoryImages[categoryId]) {
          newCategoryImages[categoryId] = [];
        }
        newCategoryImages[categoryId] = [
          ...newCategoryImages[categoryId],
          { id: imageData.id, image: imageData.image }
        ];
        return newCategoryImages;
      });
      
      // Don't show notification for individual image drops
      
    } catch (error) {
      console.error('Error adding to pending changes:', error);
      setUpdateMessage({
        type: 'error',
        text: 'შეცდომა ცვლილებების დამატებისას'
      });
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    }
  };

  const saveAllChanges = async () => {
    if (pendingChanges.length === 0) {
      setUpdateMessage({
        type: 'error',
        text: 'არ არის ცვლილებები შესანახად'
      });
      setTimeout(() => setUpdateMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setUpdateMessage(null);
    
    try {
      // Group changes by product ID to minimize API calls
      const changesByProduct = pendingChanges.reduce((acc, change) => {
        if (!acc[change.productId]) {
          acc[change.productId] = change.categoryId;
        }
        return acc;
      }, {} as Record<string, string>);
      
      // Apply all changes
      const updatePromises = Object.entries(changesByProduct).map(
        ([productId, categoryId]) => updateProduct(productId, { categoryId })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setProducts(products.map(product => {
        const newCategoryId = changesByProduct[product.id];
        if (newCategoryId) {
          return { ...product, categoryId: newCategoryId };
        }
        return product;
      }));
      
      // Clear pending changes
      setPendingChanges([]);
      
      setUpdateMessage({
        type: 'success',
        text: 'ყველა ცვლილება შენახულია!'
      });
      
    } catch (error) {
      console.error('Error saving changes:', error);
      setUpdateMessage({
        type: 'error',
        text: 'შეცდომა ცვლილებების შენახვისას'
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const hasPendingChanges = pendingChanges.length > 0;

  return (
    <AdminLayout>
      {isDistributionModalOpen ? (
        <DndProvider backend={HTML5Backend}>
          <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center border-b p-4 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsDistributionModalOpen(false)}
                  className="mr-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  უკან დაბრუნება
                </Button>
                <h2 className="text-xl font-bold">ფოტოების გადანაწილება კატეგორიებში</h2>
              </div>
              
              <Button 
                onClick={saveAllChanges} 
                disabled={!hasPendingChanges || isSaving}
                className={`text-white font-bold px-6 py-2 ${hasPendingChanges ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"}`}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    მიმდინარეობს შენახვა...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    ცვლილებების შენახვა {hasPendingChanges && (
                      <span className="ml-2 px-2 py-0.5 bg-white text-green-700 rounded-full text-sm font-bold">
                        {pendingChanges.length}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
              
            {updateMessage && (
              <div className={`p-3 mx-4 mt-2 rounded ${
                updateMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {updateMessage.text}
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 p-4 overflow-auto h-full">
              {/* Images Section */}
              <div className="w-full md:w-1/2 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 bg-white p-3 rounded-lg shadow-sm">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">პროდუქტის ფოტოები</h3>
                  <span className="text-sm text-muted-foreground ml-2">
                    გადაიტანეთ ფოტოები მარჯვნივ კატეგორიაში
                  </span>
                </div>
                
                <div className="border rounded-lg overflow-y-auto flex-1 p-4 bg-gray-50 shadow-inner">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {allImages.length === 0 ? (
                      <div className="col-span-full py-8 text-center text-muted-foreground">
                        ფოტოები არ მოიძებნა
                      </div>
                    ) : (
                      allImages.map((imageData, index) => (
                        <DraggableImage
                          key={`${imageData.id}-${index}`}
                          image={imageData.image}
                          productId={imageData.productId}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Categories Section */}
              <div className="w-full md:w-1/2 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 bg-white p-3 rounded-lg shadow-sm">
                  <Grid className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">კატეგორიები</h3>
                  {hasPendingChanges && (
                    <span className="ml-auto text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                      {pendingChanges.length} შეუნახავი ცვლილება
                    </span>
                  )}
                </div>
                
                <div className="border rounded-lg overflow-y-auto flex-1 p-4 bg-gray-50 shadow-inner">
                  <div className="space-y-4">
                    {categories.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        კატეგორიები არ მოიძებნა
                      </div>
                    ) : (
                      categories.map(category => (
                        <CategoryDropZone
                          key={category.id}
                          category={category}
                          onImageDrop={handleImageDrop}
                          pendingImages={categoryImages[category.id] || []}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DndProvider>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">კატეგორიების მართვა</h1>
              <p className="text-muted-foreground mt-1">
                ორგანიზება გაუკეთეთ თქვენს პროდუქტებს კატეგორიების დამატებით
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <Button
                onClick={() => setIsDistributionModalOpen(true)}
                variant="outline"
                className="bg-primary/10 border-primary text-primary hover:bg-primary/20"
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                ფოტოების გადანაწილება
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
              >
                <Plus className="mr-2 h-4 w-4" />
                კატეგორიის დამატება
              </Button>
            </div>
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
      )}
    </AdminLayout>
  );
} 