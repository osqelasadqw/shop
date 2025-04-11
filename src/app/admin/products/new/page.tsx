'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { getCategories, createProduct, uploadImagesToFirebase } from '@/lib/firebase-service';
import { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Image upload states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setCategoryId(categoriesData[0].id);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'პროდუქტის სახელი აუცილებელია';
    }
    
    if (!description.trim()) {
      newErrors.description = 'პროდუქტის აღწერა აუცილებელია';
    }
    
    if (!price.trim()) {
      newErrors.price = 'ფასი აუცილებელია';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      newErrors.price = 'ფასი უნდა იყოს დადებითი რიცხვი';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateImageFile = (file: File): string | null => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return `ფაილის ზომა ${(file.size / (1024 * 1024)).toFixed(2)}MB აღემატება ლიმიტს (5MB)`;
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return `არასწორი ფაილის ტიპი. გამოიყენეთ: JPEG, PNG, WEBP, GIF`;
    }
    
    return null;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Check if adding these files would exceed the 5 image limit
    if (imageFiles.length + files.length > 5) {
      setUploadError('მაქსიმუმ 5 სურათის ატვირთვაა შესაძლებელი');
      return;
    }
    
    // Check individual file sizes
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError(`${oversizedFiles.length} სურათის ზომა აღემატება დასაშვებს (5MB)`);
      return;
    }
    
    const newFiles = Array.from(files);
    
    // Create previews for the files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    
    // Update state with new files and previews
    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setUploadProgress(prev => [...prev, ...Array(files.length).fill(0)]);
    
    // Clear any previous errors
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setImagePreviews(prevPreviews => {
      // Revoke the URL to avoid memory leaks
      URL.revokeObjectURL(prevPreviews[index]);
      return prevPreviews.filter((_, i) => i !== index);
    });
    setUploadProgress(prevProgress => prevProgress.filter((_, i) => i !== index));
    if (uploadError && imageFiles.length <= 5) {
      setUploadError(null);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!imageFiles.length) return [];
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // Use our new utility function that handles WebP conversion and uploading
      const imageUrls = await uploadImagesToFirebase(
        imageFiles,
        (index, progress) => {
          setUploadProgress(prevProgress => {
            const newProgress = [...prevProgress];
            newProgress[index] = progress;
            return newProgress;
          });
        }
      );
      
      console.log('All images uploaded successfully:', imageUrls);
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error instanceof Error ? error.message : 'სურათების ატვირთვა ვერ მოხერხდა';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setUploadError(null);
      
      // Upload images first
      const imageUrls = await uploadImages();
      
      // Create the product with image URLs
      await createProduct({
        name,
        description,
        price: parseFloat(price),
        images: imageUrls,
        categoryId,
      });
      
      // Redirect to products list
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error ? error.message : 'პროდუქტის შექმნა ვერ მოხერხდა';
      setUploadError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">პროდუქტის დამატება</h1>
            <p className="text-muted-foreground mt-1">
              შეავსეთ ფორმა ახალი პროდუქტის დასამატებლად
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            უკან დაბრუნება
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 max-h-[calc(100vh-11rem)] overflow-y-auto">
          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
              <p><strong>შეცდომა:</strong> {uploadError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">პროდუქტის სახელი</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="price">ფასი (GEL)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={errors.price ? 'border-red-500' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="category">კატეგორია</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    disabled={isSubmitting || isLoading}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload Section */}
                <div>
                  <Label htmlFor="images">პროდუქტის სურათები</Label>
                  <div className="mt-1">
                    <div className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                         onClick={() => document.getElementById('image-upload')?.click()}>
                      <input 
                        id="image-upload" 
                        type="file" 
                        accept="image/jpeg,image/png,image/webp,image/gif" 
                        multiple 
                        onChange={handleImageChange} 
                        className="hidden"
                        disabled={isSubmitting || isUploading} 
                      />
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-500 mt-2">აირჩიეთ სურათები</p>
                        <p className="text-xs text-gray-400">მაქსიმუმ 5 სურათი, თითო მაქს. 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Image Previews with Upload Progress */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-1">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square border border-dashed rounded-md overflow-hidden">
                          <img 
                            src={preview} 
                            alt={`Preview ${index}`} 
                            className="w-full h-full object-contain" 
                          />
                          
                          {/* Progress Text below image area */} 
                          <div className="absolute bottom-0 left-0 right-0 p-1 bg-white bg-opacity-75">
                            <p className="text-xs text-gray-700 text-center">
                              {uploadProgress[index] > 0 && uploadProgress[index] < 100 
                                ? `${uploadProgress[index].toFixed(0)}%` 
                                : uploadProgress[index] === 100 ? 'დასრულდა' : 'მზადაა'}
                            </p>
                          </div>
                          
                          {/* Delete button */} 
                          <button 
                            type="button"
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-70 hover:opacity-100"
                            onClick={() => removeImage(index)}
                            disabled={isSubmitting || isUploading}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">პროდუქტის აღწერა</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`h-40 ${errors.description ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting || isUploading}
              >
                გაუქმება
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || isLoading || isUploading}
              >
                {isSubmitting || isUploading ? 'მიმდინარეობს შენახვა...' : 'პროდუქტის დამატება'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}