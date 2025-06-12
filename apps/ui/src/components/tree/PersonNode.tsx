import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { UserIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Person } from '@/types/person';

interface PersonNodeProps {
  data: {
    person: Person;
    onEdit: () => void;
    onAddRelative: (type: string) => void;
    generation: number;
  };
  selected: boolean;
}

export const PersonNode = memo(({ data, selected }: PersonNodeProps) => {
  const { person, onEdit, onAddRelative, generation } = data;

  const getNodeColor = () => {
    if (generation < 0) return 'border-blue-500 bg-blue-50'; // Ancestors
    if (generation > 0) return 'border-green-500 bg-green-50'; // Descendants
    return 'border-amber-500 bg-amber-50'; // Current generation
  };

  const getLifespan = () => {
    const birthYear = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const deathYear = person.deathDate ? new Date(person.deathDate).getFullYear() : person.isDeceased ? '?' : '';
    
    if (deathYear) {
      return `(${birthYear} - ${deathYear})`;
    } else if (person.isDeceased) {
      return `(${birthYear} - ?)`;
    } else {
      return `(b. ${birthYear})`;
    }
  };

  return (
    <div className="relative group">
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ bottom: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
        style={{ right: -6 }}
      />

      {/* Person card */}
      <div
        className={`
          min-w-[200px] max-w-[250px] p-4 rounded-lg border-2 bg-white shadow-lg
          transition-all duration-200 hover:shadow-xl cursor-pointer
          ${getNodeColor()}
          ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
        `}
        onClick={onEdit}
      >
        {/* Avatar and basic info */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {person.profilePicture ? (
              <img
                src={person.profilePicture}
                alt={`${person.firstName} ${person.lastName}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                <UserIcon className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {person.firstName} {person.lastName}
            </h3>
            {person.birthName && person.birthName !== `${person.firstName} ${person.lastName}` && (
              <p className="text-xs text-gray-500 truncate">
                née {person.birthName}
              </p>
            )}
            <p className="text-xs text-gray-600">
              {getLifespan()}
            </p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-3 space-y-1">
          {person.birthPlace && (
            <p className="text-xs text-gray-600 truncate">
              📍 {person.birthPlace}
            </p>
          )}
          {person.occupation && (
            <p className="text-xs text-gray-600 truncate">
              💼 {person.occupation}
            </p>
          )}
          {person.spouse && (
            <p className="text-xs text-gray-600 truncate">
              💑 Married to {person.spouse}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>ID: {person.id.slice(-6)}</span>
          <div className="flex items-center space-x-2">
            {person.mediaCount && person.mediaCount > 0 && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📷 {person.mediaCount}
              </span>
            )}
            {person.sourceCount && person.sourceCount > 0 && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                📄 {person.sourceCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons (show on hover) */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
            title="Edit person"
          >
            <PencilIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Add relative buttons (show on hover) */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRelative('parent');
            }}
            className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
            title="Add parent"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRelative('spouse');
            }}
            className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors"
            title="Add spouse"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddRelative('child');
            }}
            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors"
            title="Add child"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="absolute -top-1 -left-1">
        {person.isDeceased && (
          <div className="w-4 h-4 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs">
            †
          </div>
        )}
      </div>
      
      {person.isPrivate && (
        <div className="absolute top-1 right-1">
          <div className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
            🔒
          </div>
        </div>
      )}
    </div>
  );
});

PersonNode.displayName = 'PersonNode'; 