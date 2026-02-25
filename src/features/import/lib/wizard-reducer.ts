export type WizardStep = 'upload' | 'review-items' | 'review-photos' | 'confirm' | 'summary';

export interface PexelsPhoto {
  id: number;
  src: string;
  srcLarge: string;
  alt: string;
  photographer: string;
}

export interface ImportItem {
  rowIndex: number;
  name: string;
  categoryId: string | null;
  categoryNameRaw: string;
  targetAmount: number;
  donationType: 'monetary' | 'physical';
  description: string;
  photoOptions: PexelsPhoto[];
  selectedPhotoUrl: string | null;
  isValid: boolean;
  validationErrors: string[];
  isExcluded: boolean;
}

export interface ImportResult {
  rowIndex: number;
  name: string;
  success: boolean;
  productId?: string;
  error?: string;
}

export interface WizardState {
  step: WizardStep;
  items: ImportItem[];
  results: ImportResult[];
  isProcessing: boolean;
  processingIndex: number;
}

export type WizardAction =
  | { type: 'SET_ITEMS'; items: ImportItem[] }
  | { type: 'UPDATE_ITEM'; index: number; updates: Partial<ImportItem> }
  | { type: 'EXCLUDE_ITEM'; index: number }
  | { type: 'INCLUDE_ITEM'; index: number }
  | { type: 'SET_PHOTO_OPTIONS'; index: number; photos: PexelsPhoto[] }
  | { type: 'SELECT_PHOTO'; index: number; photoUrl: string }
  | { type: 'GO_TO_STEP'; step: WizardStep }
  | { type: 'SET_PROCESSING'; isProcessing: boolean; index?: number }
  | { type: 'ADD_RESULT'; result: ImportResult }
  | { type: 'RESET' };

export const initialWizardState: WizardState = {
  step: 'upload',
  items: [],
  results: [],
  isProcessing: false,
  processingIndex: 0,
};

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.items,
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, ...action.updates } : item
        ),
      };

    case 'EXCLUDE_ITEM':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, isExcluded: true } : item
        ),
      };

    case 'INCLUDE_ITEM':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, isExcluded: false } : item
        ),
      };

    case 'SET_PHOTO_OPTIONS':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, photoOptions: action.photos } : item
        ),
      };

    case 'SELECT_PHOTO':
      return {
        ...state,
        items: state.items.map((item, idx) =>
          idx === action.index ? { ...item, selectedPhotoUrl: action.photoUrl } : item
        ),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        step: action.step,
      };

    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.isProcessing,
        processingIndex: action.index ?? state.processingIndex,
      };

    case 'ADD_RESULT':
      return {
        ...state,
        results: [...state.results, action.result],
      };

    case 'RESET':
      return initialWizardState;

    default:
      return state;
  }
}
