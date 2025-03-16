interface ButtonProps {
  onClick: () => void;
  children: string;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 pointer cursor-pointer"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
