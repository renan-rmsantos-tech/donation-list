import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockMonetaryProduct = {
  id: '1',
  name: 'Monetary Product',
  description: 'A monetary donation item',
  donationType: 'monetary' as const,
  targetAmount: 10000,
  currentAmount: 5000,
  isFulfilled: false,
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
  isFulfilled: true,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  productCategories: [
    { categories: { id: 'cat-2', name: 'Garden' } },
  ],
};

describe('ProductCard', () => {
  describe('Required donor-facing fields', () => {
    it('should display product name', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      expect(screen.getByText('Monetary Product')).toBeInTheDocument();
    });

    it('should display product description', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      expect(screen.getByText('A monetary donation item')).toBeInTheDocument();
    });

    it('should display category context when present', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      expect(screen.getByText(/Categorias: Sacristy/)).toBeInTheDocument();
    });

    it('should not display categories label when product has no categories', () => {
      const productNoCategories = {
        ...mockMonetaryProduct,
        productCategories: [],
      };
      render(<ProductCard product={productNoCategories} />);
      expect(screen.queryByText(/Categorias:/)).not.toBeInTheDocument();
    });
  });

  describe('Monetary product progress', () => {
    it('should display progress bar for monetary products', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      expect(screen.getByText('Progresso')).toBeInTheDocument();
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it('should display full funding state for fully funded monetary product', () => {
      const fullyFunded = {
        ...mockMonetaryProduct,
        currentAmount: 10000,
      };
      render(<ProductCard product={fullyFunded} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  describe('Physical product status', () => {
    it('should display Fulfilled badge for fulfilled physical product', () => {
      render(<ProductCard product={mockPhysicalProduct} />);
      expect(screen.getByText('Atendido')).toBeInTheDocument();
    });

    it('should display Needed badge for unfulfilled physical product', () => {
      const unfulfilled = { ...mockPhysicalProduct, isFulfilled: false };
      render(<ProductCard product={unfulfilled} />);
      expect(screen.getByText('Necessário')).toBeInTheDocument();
    });
  });

  describe('Donation type', () => {
    it('should display Monetary type for monetary products', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      expect(screen.getByText('Monetária')).toBeInTheDocument();
    });

    it('should display Physical type for physical products', () => {
      render(<ProductCard product={mockPhysicalProduct} />);
      expect(screen.getByText('Física')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should link to product detail page', () => {
      render(<ProductCard product={mockMonetaryProduct} />);
      const link = screen.getByRole('link', { name: /Monetary Product/ });
      expect(link).toHaveAttribute('href', '/products/1');
    });
  });
});
