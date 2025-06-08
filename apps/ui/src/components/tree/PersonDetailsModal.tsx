import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { Person } from '@geni-clone/shared';
import { useTreeStore } from '@/stores/treeStore';
import toast from 'react-hot-toast';

interface PersonDetailsModalProps {
  personId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (personData: Partial<Person>) => void;
}

interface PersonForm {
  firstName: string;
  lastName: string;
  birthName?: string;
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  occupation?: string;
  biography?: string;
  gender: 'male' | 'female' | 'other';
  isDeceased: boolean;
  isPrivate: boolean;
}

export function PersonDetailsModal({ personId, isOpen, onClose, onSave }: PersonDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [person, setPerson] = useState<Person | null>(null);
  const { fetchPerson, updatePerson, addPerson } = useTreeStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<PersonForm>();

  // Load person data when modal opens
  useEffect(() => {
    if (isOpen && personId && personId !== 'new') {
      loadPersonData();
    } else if (isOpen && personId === 'new') {
      // Reset form for new person
      reset({
        firstName: '',
        lastName: '',
        gender: 'other',
        isDeceased: false,
        isPrivate: false
      });
      setPerson(null);
    }
  }, [isOpen, personId, reset]);

  const loadPersonData = async () => {
    setIsLoading(true);
    try {
      const personData = await fetchPerson(personId);
      setPerson(personData);
      
      // Populate form with person data
      reset({
        firstName: personData.firstName || '',
        lastName: personData.lastName || '',
        birthName: personData.birthName || '',
        birthDate: personData.birthDate ? personData.birthDate.split('T')[0] : '',
        deathDate: personData.deathDate ? personData.deathDate.split('T')[0] : '',
        birthPlace: personData.birthPlace || '',
        deathPlace: personData.deathPlace || '',
        occupation: personData.occupation || '',
        biography: personData.biography || '',
        gender: personData.gender || 'other',
        isDeceased: personData.isDeceased || false,
        isPrivate: personData.isPrivate || false
      });
    } catch (error) {
      toast.error('Failed to load person data');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: PersonForm) => {
    setIsLoading(true);
    try {
      const personData = {
        ...data,
        birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
        deathDate: data.deathDate ? new Date(data.deathDate).toISOString() : undefined
      };

      if (personId === 'new') {
        await addPerson(personData);
        toast.success('Person added successfully');
      } else {
        await updatePerson(personId, personData);
        toast.success('Person updated successfully');
      }

      onSave(personData);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save person');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {personId === 'new' ? 'Add New Person' : 'Edit Person'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  type="text"
                  id="firstName"
                  className={`form-input ${errors.firstName ? 'border-error-500' : ''}`}
                  placeholder="Enter first name"
                />
                {errors.firstName && (
                  <p className="form-error">{errors.firstName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  type="text"
                  id="lastName"
                  className={`form-input ${errors.lastName ? 'border-error-500' : ''}`}
                  placeholder="Enter last name"
                />
                {errors.lastName && (
                  <p className="form-error">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="birthName" className="form-label">
                Birth Name
              </label>
              <input
                {...register('birthName')}
                type="text"
                id="birthName"
                className="form-input"
                placeholder="Enter birth name (if different)"
              />
            </div>

            {/* Dates and Places */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="birthDate" className="form-label">
                  Birth Date
                </label>
                <input
                  {...register('birthDate')}
                  type="date"
                  id="birthDate"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="birthPlace" className="form-label">
                  Birth Place
                </label>
                <input
                  {...register('birthPlace')}
                  type="text"
                  id="birthPlace"
                  className="form-input"
                  placeholder="Enter birth place"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="deathDate" className="form-label">
                  Death Date
                </label>
                <input
                  {...register('deathDate')}
                  type="date"
                  id="deathDate"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="deathPlace" className="form-label">
                  Death Place
                </label>
                <input
                  {...register('deathPlace')}
                  type="text"
                  id="deathPlace"
                  className="form-input"
                  placeholder="Enter death place"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-group">
              <label htmlFor="occupation" className="form-label">
                Occupation
              </label>
              <input
                {...register('occupation')}
                type="text"
                id="occupation"
                className="form-input"
                placeholder="Enter occupation"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biography" className="form-label">
                Biography
              </label>
              <textarea
                {...register('biography')}
                id="biography"
                rows={4}
                className="form-input"
                placeholder="Enter biography or life story"
              />
            </div>

            {/* Gender and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  {...register('gender')}
                  id="gender"
                  className="form-input"
                >
                  <option value="other">Not specified</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <div className="flex items-center">
                  <input
                    {...register('isDeceased')}
                    type="checkbox"
                    id="isDeceased"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDeceased" className="ml-2 block text-sm text-gray-700">
                    Deceased
                  </label>
                </div>
              </div>

              <div className="form-group">
                <div className="flex items-center">
                  <input
                    {...register('isPrivate')}
                    type="checkbox"
                    id="isPrivate"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                    Private
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading || (!isDirty && personId !== 'new')}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  personId === 'new' ? 'Add Person' : 'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 