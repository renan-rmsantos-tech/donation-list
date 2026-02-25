import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from '../ProductGrid';

const mockMonetaryProduct = {
  id: '1',
  name: 'Monetary Product',
  description: 'A monetary donation item',
  donationType: 'monetary' as const,
  targetAmount: 10000,
  currentAmount: 5000,
  isFulfilled: false,
      imagePath: null,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  productCategories: [
    { categories: { id: 'cat-1', name: 'Sacristy' } },
  ],
};

const mockPhysicalProduct = {
  id: '2',
  name: 'Physical Product',
  description: 'A physical donation item',
  donationType: 'physical' as const,
  targetAmount: null,
  currentAmount: 0,
  isFulfilled: false,
      imagePath: null,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  productCategories: [
    { categories: { id: 'cat-2', name: 'Garden' } },
  ],
};

describe('ProductGrid', () => {
  describe('Empty state', () => {
    it('should display default empty message when no products', () => {
      render(<ProductGrid products={[]} />);
      expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    });

    it('should display custom empty message when provided', () => {
      render(
        <ProductGrid
          products={[]}
          emptyMessage="Nenhum produto encontrado nesta categoria."
        />
      );
      expect(screen.getByText('Nenhum produto encontrado nesta categoria.')).toBeInTheDocument();
    });
  });

  describe('Product listing', () => {
    it('should render monetary and physical products', () => {
      render(
        <ProductGrid products={[mockMonetaryProduct, mockPhysicalProduct]} />
      );
      expect(screen.getByText('Monetary Product')).toBeInTheDocument();
      expect(screen.getByText('Physical Product')).toBeInTheDocument();
    });

    it('should display product descriptions', () => {
      render(
        <ProductGrid products={[mockMonetaryProduct, mockPhysicalProduct]} />
      );
      expect(screen.getByText('A monetary donation item')).toBeInTheDocument();
      expect(screen.getByText('A physical donation item')).toBeInTheDocument();
    });

    it('should display category context for products', () => {
      render(
        <ProductGrid products={[mockMonetaryProduct, mockPhysicalProduct]} />
      );
      expect(screen.getByText(/Categorias: Sacristy/)).toBeInTheDocument();
      expect(screen.getByText(/Categorias: Garden/)).toBeInTheDocument();
    });

    it('should display donation type labels', () => {
      render(
        <ProductGrid products={[mockMonetaryProduct, mockPhysicalProduct]} />
      );
      expect(screen.getAllByText('Monetária').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Física').length).toBeGreaterThan(0);
    });

    it('should render links to product detail pages', () => {
      render(
        <ProductGrid products={[mockMonetaryProduct]} />
      );
      const link = screen.getByRole('link', { name: /Monetary Product/ });
      expect(link).toHaveAttribute('href', '/products/1');
    });
  });
});
