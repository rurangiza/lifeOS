interface ButtonProps {
  onClick: () => void;
  children: string;
}

export default function Button({ onClick, children }: ButtonProps) {
  return (
    <button
      style={{fontSize: "16px", fontWeight: "600"}}
      className="text-sm text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 pointer cursor-pointer mt-4"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
