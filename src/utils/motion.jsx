// Motion Animation Bridge & Fallback for React 19
import React from 'react';

// Lightweight fallback components in case package is pending download
const FallbackComponent = React.forwardRef(({ children, className, style, onClick, id, title, type, disabled, ...rest }, ref) => {
  return (
    <div ref={ref} className={className} style={style} onClick={onClick} id={id} {...rest}>
      {children}
    </div>
  );
});

export const AnimatePresence = ({ children }) => <>{children}</>;

// Create a proxy that returns valid React elements for motion.div, motion.button, etc.
export const motion = new Proxy({}, {
  get: (target, prop) => {
    return React.forwardRef(({ children, className, style, onClick, id, title, type, disabled, ...rest }, ref) => {
      const Tag = typeof prop === 'string' ? prop : 'div';
      // Filter out framer-motion specific props from reaching DOM
      const { initial, animate, exit, transition, whileHover, whileTap, ...domProps } = rest;
      return (
        <Tag
          ref={ref}
          className={className}
          style={style}
          onClick={onClick}
          id={id}
          title={title}
          type={type}
          disabled={disabled}
          {...domProps}
        >
          {children}
        </Tag>
      );
    });
  }
});
