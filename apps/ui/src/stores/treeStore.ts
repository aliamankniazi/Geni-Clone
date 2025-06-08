import { create } from 'zustand';
import axios from 'axios';
import { Person, Relationship } from '@geni-clone/shared';

interface TreeState {
  familyTreeData: any | null;
  persons: Person[];
  relationships: Relationship[];
  isLoading: boolean;
  selectedPersonId: string | null;
  
  // Actions
  fetchFamilyTree: (rootPersonId: string, generations: number) => Promise<void>;
  fetchPerson: (personId: string) => Promise<Person>;
  addPerson: (personData: Partial<Person>) => Promise<Person>;
  updatePerson: (personId: string, updates: Partial<Person>) => Promise<Person>;
  deletePerson: (personId: string) => Promise<void>;
  addRelationship: (relationshipData: Partial<Relationship>) => Promise<Relationship>;
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => Promise<Relationship>;
  deleteRelationship: (relationshipId: string) => Promise<void>;
  setSelectedPerson: (personId: string | null) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  familyTreeData: null,
  persons: [],
  relationships: [],
  isLoading: false,
  selectedPersonId: null,

  fetchFamilyTree: async (rootPersonId: string, generations: number = 3) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`/api/persons/${rootPersonId}/tree`, {
        params: { generations }
      });
      
      set({
        familyTreeData: response.data.data,
        isLoading: false
      });
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to fetch family tree');
    }
  },

  fetchPerson: async (personId: string) => {
    try {
      const response = await axios.get(`/api/persons/${personId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch person');
    }
  },

  addPerson: async (personData: Partial<Person>) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/api/persons', personData);
      const newPerson = response.data.data;
      
      set((state) => ({
        persons: [...state.persons, newPerson],
        isLoading: false
      }));
      
      return newPerson;
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to add person');
    }
  },

  updatePerson: async (personId: string, updates: Partial<Person>) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`/api/persons/${personId}`, updates);
      const updatedPerson = response.data.data;
      
      set((state) => ({
        persons: state.persons.map((person) =>
          person.id === personId ? updatedPerson : person
        ),
        isLoading: false
      }));
      
      return updatedPerson;
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to update person');
    }
  },

  deletePerson: async (personId: string) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/persons/${personId}`);
      
      set((state) => ({
        persons: state.persons.filter((person) => person.id !== personId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to delete person');
    }
  },

  addRelationship: async (relationshipData: Partial<Relationship>) => {
    set({ isLoading: true });
    try {
      const response = await axios.post('/api/relationships', relationshipData);
      const newRelationship = response.data.data;
      
      set((state) => ({
        relationships: [...state.relationships, newRelationship],
        isLoading: false
      }));
      
      return newRelationship;
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to add relationship');
    }
  },

  updateRelationship: async (relationshipId: string, updates: Partial<Relationship>) => {
    set({ isLoading: true });
    try {
      const response = await axios.put(`/api/relationships/${relationshipId}`, updates);
      const updatedRelationship = response.data.data;
      
      set((state) => ({
        relationships: state.relationships.map((rel) =>
          rel.id === relationshipId ? updatedRelationship : rel
        ),
        isLoading: false
      }));
      
      return updatedRelationship;
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to update relationship');
    }
  },

  deleteRelationship: async (relationshipId: string) => {
    set({ isLoading: true });
    try {
      await axios.delete(`/api/relationships/${relationshipId}`);
      
      set((state) => ({
        relationships: state.relationships.filter((rel) => rel.id !== relationshipId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ isLoading: false });
      throw new Error(error.response?.data?.message || 'Failed to delete relationship');
    }
  },

  setSelectedPerson: (personId: string | null) => {
    set({ selectedPersonId: personId });
  }
})); 