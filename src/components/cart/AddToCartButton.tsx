'use client';

import React from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { useState } from 'react';

export function AddToCartButton({ 
  product, 
  variant = 'primary',
  className = ''
}: { 
  product: CartItem, 
  variant?: 'primary' | 'secondary' | 'outline',
  className?: string 
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const baseClasses = "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-md transition-all";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-amber-500 text-white hover:bg-amber-600",
    outline: "border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
  };

  const selectedClass = variants[variant] || variants.primary;

  return (
    <button 
      onClick={handleAdd}
      disabled={added}
      className={`${baseClasses} ${selectedClass} ${added ? '!bg-green-500 !text-white !border-transparent' : ''} ${className} w-full`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" />
          تمت الإضافة
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          أضف للسلة
        </>
      )}
    </button>
  );
}
