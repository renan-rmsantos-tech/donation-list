import { getAllProducts } from '@/features/products/queries';
import { ProductList } from '@/features/products/components/ProductList';

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <ProductList products={products} />
    </div>
  );
}
