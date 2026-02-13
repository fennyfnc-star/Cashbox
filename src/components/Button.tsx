import { type ButtonHTMLAttributes } from "react";

const Button = ({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className: string }) => {
  return (
    <button
      className={`flex items-center cursor-pointer justify-center gap-2 px-4 py-2 rounded-md font-semibold text-xs ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
