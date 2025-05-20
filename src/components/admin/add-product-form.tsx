"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth'; // To potentially get token for API call
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AddProductForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useAuth(); // Example of getting token if needed for API
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const productData = {
      name,
      description,
      price: parseFloat(price),
      imageUrl,
      stock: parseInt(stock, 10),
      category,
    };

    // Simulate API call to Spring backend
    console.log('Submitting product:', productData);
    console.log('With token:', token); // For actual implementation

    try {
      // Replace with actual fetch call to your Spring backend
      // const response = await fetch('/api/products', { // Your backend endpoint
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`, // Attach token
      //   },
      //   body: JSON.stringify(productData),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to add product');
      // }
      
      // const newProduct = await response.json();
      // console.log('Product added:', newProduct);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));


      toast({ title: "Product Added!", description: `${name} has been successfully added.` });
      // Clear form or redirect
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
      setStock('');
      setCategory('');
      router.push('/'); // Redirect to home or product list
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Error Adding Product", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Add New Product</CardTitle>
        <CardDescription className="text-center">
          Fill in the details below to add a new product to the emporium.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" min="0" disabled={isSubmitting} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder="https://placehold.co/600x600.png" disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" step="1" disabled={isSubmitting} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isSubmitting} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Adding Product...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
