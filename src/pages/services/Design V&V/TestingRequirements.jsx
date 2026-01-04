function TestingRequirements() {
  const sections = {
    'EMC Test': ['ESD immunity','Radiated RF immunity','EFT/Burst immunity','Surge immunity','Conducted RF immunity','Power-frequency magnetic field immunity'],
    'Environmental Test': ['Cold test','Dry heat test','Damp heat (steady state)','Damp heat (cyclic)','Thermal cycling','Temperature shock','Vibration (sinusoidal)'],
    'Safety Test (Electrical & Mechanical)': ['Insulation resistance test','Dielectric withstand / Hi-pot test','Clearance & creepage distance check','Leakage current test','Overcurrent protection verification','Overvoltage protection verification'],
    'Functional Safety Test': ['Safety function verification','Fault injection test (hardware)','Diagnostic coverage validation','Redundancy/safe state behavior test','Software self-test verification','Safety lifecycle documentation review'],
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Design Testing Requirements</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(sections).map(([title, items]) => (
          <div key={title} className="border rounded-lg p-4">
            <div className="font-semibold mb-3">{title}</div>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-2">
              {items.map((i) => (
                <label key={i} className="flex gap-2 items-start text-sm">
                  <input type="checkbox" /> <span>{i}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button className="px-6 py-2 bg-primary text-white rounded-lg">Next</button>
      </div>
    </div>
  )
}

export default TestingRequirements


