import React, { MouseEventHandler, ReactNode } from "react";

/**
 * ButtonProps
 * Defines the prop types for the BasicButton component.
 */
export interface ButtonProps {
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Button HTML type */
  type?: "button" | "submit" | "reset";
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * BasicButton
 * A simple reusable, typed button component.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition ${className}`}
  >
    {children}
  </button>
);

export default Button;
