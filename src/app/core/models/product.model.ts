import { Category } from './category.model';

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  category?: Category;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOrder = 'asc' | 'desc';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: 'price';
  order?: SortOrder;
}
