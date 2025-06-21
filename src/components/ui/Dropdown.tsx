/**
 * Dropdown Component
 * Accessible dropdown menu component
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'item' | 'separator';
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

// ============================================================================
// Component
// ============================================================================

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className,
  menuClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }

    return undefined;
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    
    if (item.onClick) {
      item.onClick();
    }
    
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          
          {/* Menu */}
          <div
            className={cn(
              'absolute z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
              align === 'right' ? 'right-0' : 'left-0',
              menuClassName
            )}
            role="menu"
            aria-orientation="vertical"
          >
            <div className="py-1" role="none">
              {items.map((item, index) => {
                if (item.type === 'separator') {
                  return (
                    <div
                      key={index}
                      className="border-t border-gray-100 my-1"
                      role="separator"
                    />
                  );
                }

                const ItemComponent = item.href ? 'a' : 'button';
                
                return (
                  <ItemComponent
                    key={index}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'flex w-full items-center px-4 py-2 text-sm text-left',
                      item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                      'focus:outline-none focus:bg-gray-100 focus:text-gray-900'
                    )}
                    role="menuitem"
                  >
                    {item.icon && (
                      <span className="mr-3 flex-shrink-0">
                        {React.cloneElement(item.icon as React.ReactElement, {
                          className: cn('h-5 w-5', (item.icon as React.ReactElement).props?.className),
                        })}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </ItemComponent>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// Simple Select Dropdown
// ============================================================================

interface SelectDropdownProps {
  value?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string; disabled?: boolean }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className,
  disabled = false,
}) => {
  const [, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const trigger = (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-whatsapp-500 focus:outline-none focus:ring-1 focus:ring-whatsapp-500 sm:text-sm',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span className="block truncate">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </button>
  );

  const items: DropdownItem[] = options.map(option => ({
    label: option.label,
    value: option.value,
    disabled: option.disabled || false,
    onClick: () => handleSelect(option.value),
  }));

  return (
    <Dropdown
      trigger={trigger}
      items={items}
      className="w-full"
      menuClassName="w-full"
    />
  );
};

// ============================================================================
// Exports
// ============================================================================

export { Dropdown, SelectDropdown };
// Types are already exported as interfaces above
