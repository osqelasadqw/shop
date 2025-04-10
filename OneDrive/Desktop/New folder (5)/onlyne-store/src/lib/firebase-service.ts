import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase-config';
import { Product, Category } from '@/types';

// Helper function to convert Firebase timestamp to milliseconds
const convertTimestampToMillis = (timestamp: Timestamp) => {
  return timestamp.toMillis();
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    return categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  const docRef = doc(db, 'categories', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    createdAt: data.createdAt ? convertTimestampToMillis(data.createdAt) : Date.now(),
    updatedAt: data.updatedAt ? convertTimestampToMillis(data.updatedAt) : Date.now(),
  };
};

export const createCategory = async (name: string): Promise<Category> => {
  const categoriesCollection = collection(db, 'categories');
  const docRef = await addDoc(categoriesCollection, {
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  const newCategory = await getCategoryById(docRef.id);
  if (!newCategory) {
    throw new Error('Failed to create category');
  }
  
  return newCategory;
};

export const updateCategory = async (id: string, name: string): Promise<Category> => {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, {
    name,
    updatedAt: serverTimestamp(),
  });
  
  const updatedCategory = await getCategoryById(id);
  if (!updatedCategory) {
    throw new Error('Failed to update category');
  }
  
  return updatedCategory;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'categories', id));
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const productsSnapshot = await getDocs(productsRef);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('categoryId', '==', categoryId));
    const productsSnapshot = await getDocs(q);
    
    return productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'products', id);
    const productSnapshot = await getDoc(productRef);
    
    if (productSnapshot.exists()) {
      return {
        id: productSnapshot.id,
        ...productSnapshot.data()
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const createProduct = async (
  productData: {
    name: string;
    description: string;
    price: number;
    images: string[];
    categoryId?: string; // Make categoryId optional
  }
): Promise<Product> => {
  try {
    const timestamp = Date.now();
    const productRef = collection(db, 'products');
    
    const newProduct = {
      ...productData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    const docRef = await addDoc(productRef, newProduct);
    
    return {
      id: docRef.id,
      ...newProduct
    } as Product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Product> => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, {
    ...product,
    updatedAt: serverTimestamp(),
  });
  
  const updatedProduct = await getProductById(id);
  if (!updatedProduct) {
    throw new Error('Failed to update product');
  }
  
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<void> => {
  // First get the product to delete its images
  const product = await getProductById(id);
  if (product && product.images.length > 0) {
    // Delete all associated images
    await Promise.all(
      product.images.map(async (imageUrl) => {
        try {
          // Extract the path from the URL
          const imagePath = decodeURIComponent(imageUrl.split('?')[0].split('/o/')[1]);
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      })
    );
  }
  
  // Then delete the product document
  await deleteDoc(doc(db, 'products', id));
};

// Image uploads
export const uploadProductImage = async (
  file: File,
  productId: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Check file size
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File size exceeds 5MB limit: ${(file.size / (1024 * 1024)).toFixed(2)}MB`));
        return;
      }
      
      // Create a timestamp for the unique filename
      const timestamp = new Date().getTime();
      const fileName = file.name.substring(0, 50).replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize and limit filename length
      
      // Create a reference to the storage location
      const storageRef = ref(storage, `products/${productId}/${timestamp}_${fileName}`);
      
      console.log('Storage reference created:', storageRef.fullPath);
      console.log('File details:', { name: file.name, type: file.type, size: `${(file.size / 1024).toFixed(2)}KB` });
      
      // Start the upload task with metadata
      const metadata = {
        contentType: file.type
      };
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}% | Bytes: ${snapshot.bytesTransferred}/${snapshot.totalBytes}`);
          if (onProgress) {
            onProgress(progress);
          }
        },
        (error) => {
          console.error('Upload error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // Handle specific Firebase storage errors
          let errorMessage = 'Error uploading file';
          if (error.code === 'storage/unauthorized') {
            errorMessage = 'User does not have permission to access the object';
          } else if (error.code === 'storage/canceled') {
            errorMessage = 'User canceled the upload';
          } else if (error.code === 'storage/unknown') {
            errorMessage = 'Unknown error occurred, check network connection';
          } else if (error.code === 'storage/quota-exceeded') {
            errorMessage = 'Storage quota exceeded';
          }
          reject(new Error(`${errorMessage}: ${error.message}`));
        },
        async () => {
          try {
            console.log('Upload completed successfully, getting download URL...');
            // Upload completed successfully, now get the download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Download URL obtained:', downloadURL);
            resolve(downloadURL);
          } catch (urlError) {
            console.error('Error getting download URL:', urlError);
            reject(urlError);
          }
        }
      );
    } catch (initError) {
      console.error('Error initializing upload:', initError);
      reject(initError);
    }
  });
};

// User roles management
export const getUserRole = async (email: string): Promise<{isAdmin: boolean}> => {
  try {
    const userRolesRef = collection(db, 'userRoles');
    const q = query(userRolesRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      // User not found in roles collection, add them with default role
      await addDoc(userRolesRef, {
        email,
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      return { isAdmin: false };
    }
    
    // Return the user's role
    return querySnapshot.docs[0].data() as {isAdmin: boolean};
  } catch (error) {
    console.error('Error getting user role:', error);
    return { isAdmin: false };
  }
};

export const getAllUsers = async (): Promise<Array<{id: string, email: string, isAdmin: boolean, createdAt: number}>> => {
  try {
    const userRolesRef = collection(db, 'userRoles');
    const userRolesSnapshot = await getDocs(userRolesRef);
    
    return userRolesSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      isAdmin: doc.data().isAdmin,
      createdAt: doc.data().createdAt ? convertTimestampToMillis(doc.data().createdAt) : Date.now()
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<void> => {
  try {
    const userRoleRef = doc(db, 'userRoles', userId);
    await updateDoc(userRoleRef, {
      isAdmin,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}; 