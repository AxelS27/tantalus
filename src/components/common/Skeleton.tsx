import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
}

export default function Skeleton({
  variant = 'rounded',
  width,
  height,
  shimmer = true,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-2xl';
      case 'text':
        return 'rounded-md h-4';
      case 'rectangular':
      default:
        return 'rounded-none';
    }
  };

  const computedStyle: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`${shimmer ? 'skeleton-shimmer' : 'bg-[var(--skeleton-base)]'} ${getVariantClass()} ${className}`}
      style={computedStyle}
      {...props}
    />
  );
}
