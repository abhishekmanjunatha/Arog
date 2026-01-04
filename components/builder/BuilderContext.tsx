'use client';

/**
 * Builder Context
 * State management for the form builder
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BuilderElement, BuilderSchema } from '@/types/builder';
import { createDefaultElement, generateElementId, calculateNextPosition, generateUniqueFieldName } from '@/lib/builder-utils';
import { ElementType } from '@/types/builder';

// Builder State
interface BuilderState {
  schema: BuilderSchema;
  selectedElementId: string | null;
  isDragging: boolean;
  draggedElementType: ElementType | null;
  undoStack: BuilderSchema[];
  redoStack: BuilderSchema[];
}

// Action Types
type BuilderAction =
  | { type: 'ADD_ELEMENT'; elementType: ElementType }
  | { type: 'UPDATE_ELEMENT'; elementId: string; updates: Partial<BuilderElement> }
  | { type: 'DELETE_ELEMENT'; elementId: string }
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'REORDER_ELEMENTS'; fromIndex: number; toIndex: number }
  | { type: 'DUPLICATE_ELEMENT'; elementId: string }
  | { type: 'SET_SCHEMA'; schema: BuilderSchema }
  | { type: 'SET_DRAGGING'; isDragging: boolean; elementType?: ElementType | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_ALL' };

// Initial State
const initialState: BuilderState = {
  schema: {
    version: 2,
    elements: [],
  },
  selectedElementId: null,
  isDragging: false,
  draggedElementType: null,
  undoStack: [],
  redoStack: [],
};

// Reducer
function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      const existingNames = state.schema.elements.map(el => el.name);
      const newElement = createDefaultElement(action.elementType, existingNames);
      newElement.position = calculateNextPosition(state.schema.elements);
      
      return {
        ...state,
        schema: {
          ...state.schema,
          elements: [...state.schema.elements, newElement],
        },
        selectedElementId: newElement.id,
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    case 'UPDATE_ELEMENT': {
      const elements = state.schema.elements.map((el) =>
        el.id === action.elementId ? { ...el, ...action.updates } : el
      );
      
      return {
        ...state,
        schema: { ...state.schema, elements },
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    case 'DELETE_ELEMENT': {
      const elements = state.schema.elements.filter((el) => el.id !== action.elementId);
      
      return {
        ...state,
        schema: { ...state.schema, elements },
        selectedElementId: state.selectedElementId === action.elementId ? null : state.selectedElementId,
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    case 'SELECT_ELEMENT': {
      return {
        ...state,
        selectedElementId: action.elementId,
      };
    }

    case 'REORDER_ELEMENTS': {
      const elements = [...state.schema.elements];
      const [removed] = elements.splice(action.fromIndex, 1);
      elements.splice(action.toIndex, 0, removed);
      
      // Update positions
      const reorderedElements = elements.map((el, index) => ({
        ...el,
        position: { ...el.position, row: index },
      }));
      
      return {
        ...state,
        schema: { ...state.schema, elements: reorderedElements },
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    case 'DUPLICATE_ELEMENT': {
      const elementToDuplicate = state.schema.elements.find((el) => el.id === action.elementId);
      if (!elementToDuplicate) return state;
      
      const existingNames = state.schema.elements.map(el => el.name);
      const baseName = elementToDuplicate.name.replace(/_copy(_\d+)?$/, '').replace(/_\d+$/, '');
      const uniqueName = generateUniqueFieldName(`${baseName}_copy`, existingNames);
      
      const duplicatedElement: BuilderElement = {
        ...elementToDuplicate,
        id: generateElementId(),
        name: uniqueName,
        position: {
          ...elementToDuplicate.position,
          row: elementToDuplicate.position.row + 1,
        },
      };
      
      const elementIndex = state.schema.elements.findIndex((el) => el.id === action.elementId);
      const elements = [...state.schema.elements];
      elements.splice(elementIndex + 1, 0, duplicatedElement);
      
      return {
        ...state,
        schema: { ...state.schema, elements },
        selectedElementId: duplicatedElement.id,
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    case 'SET_SCHEMA': {
      return {
        ...state,
        schema: action.schema,
        selectedElementId: null,
        undoStack: [],
        redoStack: [],
      };
    }

    case 'SET_DRAGGING': {
      return {
        ...state,
        isDragging: action.isDragging,
        draggedElementType: action.elementType ?? null,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      
      const previousSchema = state.undoStack[state.undoStack.length - 1];
      const newUndoStack = state.undoStack.slice(0, -1);
      
      return {
        ...state,
        schema: previousSchema,
        undoStack: newUndoStack,
        redoStack: [...state.redoStack, state.schema],
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      
      const nextSchema = state.redoStack[state.redoStack.length - 1];
      const newRedoStack = state.redoStack.slice(0, -1);
      
      return {
        ...state,
        schema: nextSchema,
        undoStack: [...state.undoStack, state.schema],
        redoStack: newRedoStack,
      };
    }

    case 'CLEAR_ALL': {
      return {
        ...state,
        schema: { version: 2, elements: [] },
        selectedElementId: null,
        undoStack: [...state.undoStack, state.schema],
        redoStack: [],
      };
    }

    default:
      return state;
  }
}

// Context
interface BuilderContextType {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
  
  // Helper functions
  addElement: (type: ElementType) => void;
  updateElement: (elementId: string, updates: Partial<BuilderElement>) => void;
  deleteElement: (elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  reorderElements: (fromIndex: number, toIndex: number) => void;
  duplicateElement: (elementId: string) => void;
  setSchema: (schema: BuilderSchema) => void;
  getSelectedElement: () => BuilderElement | null;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

// Provider
interface BuilderProviderProps {
  children: ReactNode;
  initialSchema?: BuilderSchema;
}

export function BuilderProvider({ children, initialSchema }: BuilderProviderProps) {
  const [state, dispatch] = useReducer(
    builderReducer,
    initialSchema
      ? { ...initialState, schema: initialSchema }
      : initialState
  );

  const addElement = (type: ElementType) => {
    dispatch({ type: 'ADD_ELEMENT', elementType: type });
  };

  const updateElement = (elementId: string, updates: Partial<BuilderElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', elementId, updates });
  };

  const deleteElement = (elementId: string) => {
    dispatch({ type: 'DELETE_ELEMENT', elementId });
  };

  const selectElement = (elementId: string | null) => {
    dispatch({ type: 'SELECT_ELEMENT', elementId });
  };

  const reorderElements = (fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_ELEMENTS', fromIndex, toIndex });
  };

  const duplicateElement = (elementId: string) => {
    dispatch({ type: 'DUPLICATE_ELEMENT', elementId });
  };

  const setSchema = (schema: BuilderSchema) => {
    dispatch({ type: 'SET_SCHEMA', schema });
  };

  const getSelectedElement = (): BuilderElement | null => {
    if (!state.selectedElementId) return null;
    return state.schema.elements.find((el) => el.id === state.selectedElementId) || null;
  };

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  const value: BuilderContextType = {
    state,
    dispatch,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    reorderElements,
    duplicateElement,
    setSchema,
    getSelectedElement,
    undo,
    redo,
    clearAll,
    canUndo: state.undoStack.length > 0,
    canRedo: state.redoStack.length > 0,
  };

  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}

// Hook
export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return context;
}

export { BuilderContext };
