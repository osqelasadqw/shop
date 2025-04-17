'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { addPromoCodeToProduct, deactivatePromoCode, getProducts, getPromoCodes } from '@/lib/firebase-service';
import { Product/*, PromoCode*/ } from '@/types'; // Commented out problematic PromoCode import
import { toast } from 'sonner';
import { Tag, CheckCircle, AlertCircle, Trash } from 'lucide-react';

export default function AdminPromoCodesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]); // Changed type to any[]
  const [selectedProductId, setSelectedProductId] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // პროდუქტების მიღება
        const productsData = await getProducts();
        setProducts(productsData);
        
        // პრომოკოდების მიღება
        const promoCodesData = await getPromoCodes();
        setPromoCodes(promoCodesData);
      } catch (error) {
        console.error('შეცდომა მონაცემების მიღებისას:', error);
        toast.error('შეცდომა მონაცემების მიღებისას');
      }
    };
    
    fetchData();
  }, [refreshTrigger]);

  const handleAddPromoCode = async () => {
    if (!selectedProductId || !promoCode || discountPercentage <= 0 || discountPercentage > 100) {
      toast.error('გთხოვთ შეავსოთ ყველა ველი სწორად');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await addPromoCodeToProduct(selectedProductId, promoCode, discountPercentage);
      toast.success('პრომოკოდი წარმატებით დაემატა');
      
      // ფორმის გასუფთავება
      setSelectedProductId('');
      setPromoCode('');
      setDiscountPercentage(10);
      
      // განახლება
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('შეცდომა პრომოკოდის დამატებისას:', error);
      toast.error('შეცდომა პრომოკოდის დამატებისას');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivatePromoCode = async (productId: string) => {
    setIsLoading(true);
    
    try {
      await deactivatePromoCode(productId);
      toast.success('პრომოკოდი წარმატებით დეაქტივირდა');
      
      // განახლება
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('შეცდომა პრომოკოდის დეაქტივაციისას:', error);
      toast.error('შეცდომა პრომოკოდის დეაქტივაციისას');
    } finally {
      setIsLoading(false);
    }
  };

  // პროდუქტის სახელის მიღება ID-ით
  const getProductNameById = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'უცნობი პროდუქტი';
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">პრომოკოდების მართვა</h1>
        
        {/* ახალი პრომოკოდის დამატების ფორმა */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>ახალი პრომოკოდის დამატება</CardTitle>
            <CardDescription>
              დაამატეთ პრომოკოდი კონკრეტულ პროდუქტზე ფასდაკლებისთვის
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product">პროდუქტი</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger id="product">
                    <SelectValue placeholder="აირჩიეთ პროდუქტი" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="promoCode">პრომოკოდი</Label>
                <div className="flex items-center gap-2">
                  <Tag className="text-muted-foreground" size={16} />
                  <Input
                    id="promoCode"
                    placeholder="მაგ: SUMMER20"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discount">ფასდაკლება (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="1"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddPromoCode}
              disabled={isLoading || !selectedProductId || !promoCode || discountPercentage <= 0 || discountPercentage > 100}
            >
              პრომოკოდის დამატება
            </Button>
          </CardFooter>
        </Card>
        
        {/* პრომოკოდების ცხრილი */}
        <Card>
          <CardHeader>
            <CardTitle>არსებული პრომოკოდები</CardTitle>
            <CardDescription>
              ყველა პროდუქტის პრომოკოდი და მათი სტატუსი
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>პროდუქტი</TableHead>
                  <TableHead>პრომოკოდი</TableHead>
                  <TableHead>ფასდაკლება</TableHead>
                  <TableHead>სტატუსი</TableHead>
                  <TableHead>მოქმედება</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.length > 0 ? (
                  promoCodes.map((code) => (
                    <TableRow key={code.code}>
                      <TableCell>{getProductNameById(code.productId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag size={14} />
                          <span>{code.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>{code.discountPercentage}%</TableCell>
                      <TableCell>
                        {code.active ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={14} />
                            <span>აქტიური</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-500">
                            <AlertCircle size={14} />
                            <span>არააქტიური</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {code.active && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeactivatePromoCode(code.productId)}
                            disabled={isLoading}
                          >
                            <Trash size={14} className="mr-1" />
                            დეაქტივაცია
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      პრომოკოდები არ არის დამატებული
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 