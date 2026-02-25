import { describe, it, expect } from 'vitest';
import {
  wizardReducer,
  initialWizardState,
  ImportItem,
  PexelsPhoto,
  WizardState,
} from '../lib/wizard-reducer';

describe('wizardReducer', () => {
  it('should return initial state', () => {
    const state = initialWizardState;
    expect(state.step).toBe('upload');
    expect(state.items).toEqual([]);
    expect(state.results).toEqual([]);
    expect(state.isProcessing).toBe(false);
    expect(state.processingIndex).toBe(0);
  });

  it('should handle SET_ITEMS action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: false,
      },
    ];

    const newState = wizardReducer(initialWizardState, {
      type: 'SET_ITEMS',
      items: mockItems,
    });

    expect(newState.items).toEqual(mockItems);
    expect(newState.items.length).toBe(1);
  });

  it('should handle UPDATE_ITEM action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: false,
      },
    ];

    const stateWithItems = {
      ...initialWizardState,
      items: mockItems,
    };

    const newState = wizardReducer(stateWithItems, {
      type: 'UPDATE_ITEM',
      index: 0,
      updates: { name: 'Updated Item', categoryId: 'uuid-123' },
    });

    expect(newState.items[0].name).toBe('Updated Item');
    expect(newState.items[0].categoryId).toBe('uuid-123');
  });

  it('should handle EXCLUDE_ITEM action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: false,
      },
    ];

    const stateWithItems = {
      ...initialWizardState,
      items: mockItems,
    };

    const newState = wizardReducer(stateWithItems, {
      type: 'EXCLUDE_ITEM',
      index: 0,
    });

    expect(newState.items[0].isExcluded).toBe(true);
  });

  it('should handle INCLUDE_ITEM action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: true,
      },
    ];

    const stateWithItems = {
      ...initialWizardState,
      items: mockItems,
    };

    const newState = wizardReducer(stateWithItems, {
      type: 'INCLUDE_ITEM',
      index: 0,
    });

    expect(newState.items[0].isExcluded).toBe(false);
  });

  it('should handle SET_PHOTO_OPTIONS action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: false,
      },
    ];

    const stateWithItems = {
      ...initialWizardState,
      items: mockItems,
    };

    const mockPhotos: PexelsPhoto[] = [
      {
        id: 1,
        src: 'https://images.pexels.com/photo1.jpg',
        srcLarge: 'https://images.pexels.com/photo1-large.jpg',
        alt: 'Photo 1',
        photographer: 'Photographer 1',
      },
    ];

    const newState = wizardReducer(stateWithItems, {
      type: 'SET_PHOTO_OPTIONS',
      index: 0,
      photos: mockPhotos,
    });

    expect(newState.items[0].photoOptions).toEqual(mockPhotos);
  });

  it('should handle SELECT_PHOTO action', () => {
    const mockItems: ImportItem[] = [
      {
        rowIndex: 0,
        name: 'Test Item',
        categoryId: null,
        categoryNameRaw: 'Category',
        targetAmount: 1000,
        donationType: 'monetary',
        description: 'Test description',
        photoOptions: [],
        selectedPhotoUrl: null,
        isValid: true,
        validationErrors: [],
        isExcluded: false,
      },
    ];

    const stateWithItems = {
      ...initialWizardState,
      items: mockItems,
    };

    const newState = wizardReducer(stateWithItems, {
      type: 'SELECT_PHOTO',
      index: 0,
      photoUrl: 'https://images.pexels.com/photo1.jpg',
    });

    expect(newState.items[0].selectedPhotoUrl).toBe('https://images.pexels.com/photo1.jpg');
  });

  it('should handle GO_TO_STEP action', () => {
    const newState = wizardReducer(initialWizardState, {
      type: 'GO_TO_STEP',
      step: 'review-items',
    });

    expect(newState.step).toBe('review-items');
  });

  it('should handle SET_PROCESSING action', () => {
    const newState = wizardReducer(initialWizardState, {
      type: 'SET_PROCESSING',
      isProcessing: true,
      index: 5,
    });

    expect(newState.isProcessing).toBe(true);
    expect(newState.processingIndex).toBe(5);
  });

  it('should handle ADD_RESULT action', () => {
    const newState = wizardReducer(initialWizardState, {
      type: 'ADD_RESULT',
      result: {
        rowIndex: 0,
        name: 'Test Item',
        success: true,
        productId: 'product-uuid-123',
      },
    });

    expect(newState.results.length).toBe(1);
    expect(newState.results[0].success).toBe(true);
    expect(newState.results[0].productId).toBe('product-uuid-123');
  });

  it('should handle RESET action', () => {
    const stateWithData: WizardState = {
      step: 'confirm',
      items: [
        {
          rowIndex: 0,
          name: 'Test Item',
          categoryId: 'uuid-123',
          categoryNameRaw: 'Category',
          targetAmount: 1000,
          donationType: 'monetary',
          description: 'Test description',
          photoOptions: [],
          selectedPhotoUrl: 'https://images.pexels.com/photo1.jpg',
          isValid: true,
          validationErrors: [],
          isExcluded: false,
        },
      ],
      results: [
        {
          rowIndex: 0,
          name: 'Test Item',
          success: true,
          productId: 'product-uuid-123',
        },
      ],
      isProcessing: true,
      processingIndex: 1,
    };

    const newState = wizardReducer(stateWithData, {
      type: 'RESET',
    });

    expect(newState).toEqual(initialWizardState);
  });
});
