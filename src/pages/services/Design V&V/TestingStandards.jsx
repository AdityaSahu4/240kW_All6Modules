function TestingStandards() {
  const recommended = [
    'ESD immunity: IEC 61000-4-2',
    'Conducted RF immunity: IEC 61000-4-6',
  ]
  const preferred = [
    'Cold Test: IEC 60068-2-1',
    'Dry Heat Test: IEC 60068-2-2',
    'Damp Heat (Steady State): IEC 60068-2-78',
    'Damp Heat (Cyclic): IEC 60068-2-30',
    'Thermal Cycling: IEC 60068-2-14',
    'Temperature Shock: IEC 60068-2-14 / IEC 60068-2-33',
    'Vibration (Sinusoidal): IEC 60068-2-6',
  ]
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Design Testing Standards</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-3">Recommended Standards</div>
          <div className="space-y-2 text-sm">
            {recommended.map((r) => (
              <label key={r} className="flex gap-2 items-start">
                <input type="checkbox" defaultChecked /> <span>{r}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-3">Preferred Standards</div>
          <input placeholder="Search" className="w-full mb-3 px-3 py-2 border rounded-lg" />
          <div className="space-y-2 max-h-56 overflow-auto pr-2 text-sm">
            {preferred.map((p) => (
              <label key={p} className="flex gap-2 items-start">
                <input type="checkbox" /> <span>{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <button className="px-6 py-2 bg-primary text-white rounded-lg">Next</button>
      </div>
    </div>
  )
}

export default TestingStandards


