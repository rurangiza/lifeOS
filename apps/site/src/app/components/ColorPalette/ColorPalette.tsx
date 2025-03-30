interface ColorPaletteProps {
  colors: string[]
}

export default function ColorPalette({colors}: ColorPaletteProps) {
  // grid grid-cols-4 grid-rows-3 gap-0 -m-4
  return (
    <>
      <div className="mb-8">
        {colors.map((color, index) => (
          <div
            key={`${index}-${color}`}
            style={{backgroundColor: `#${color}`}}
            className="inline-block h-16 w-16 rounded-full border-4 border-white -m-2"
          >
          </div>
        ))}
      </div>
    </>
  )
}