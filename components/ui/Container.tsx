import React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  as: Component = "div",
  className = "",
  children,
  ...props
}) => {
  return (
    <Component
      className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Container;
