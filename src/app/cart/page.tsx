import { Metadata } from 'next';
import CartClient from './CartClient';

export const metadata: Metadata = {
  title: 'سلة المشتريات',
  description: 'مراجعة المنتجات في سلة المشتريات الخاصة بك وإتمام الطلب.',
};

export default function CartPage() {
  return <CartClient />;
}
