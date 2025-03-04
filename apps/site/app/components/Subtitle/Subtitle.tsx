interface SubtitleProps {
  children: string
}

export default function Subtitle({ children }: SubtitleProps) {
  return (
    <p className="flex text-sm text-gray-500 -mt-3 mb-3">{children}</p>
  );
}
