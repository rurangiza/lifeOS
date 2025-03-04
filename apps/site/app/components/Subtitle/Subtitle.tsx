interface SubtitleProps {
  children: string
}

export default function Small({ children }: SubtitleProps) {
  return (
    <small className="flex text-sm text-gray-500 -mt-3 mb-3">{children}</small>
  );
}
