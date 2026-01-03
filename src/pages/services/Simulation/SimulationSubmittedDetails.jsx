import { motion } from "framer-motion"
import {
  CheckCircle,
  FileText,
  Package,
  Cpu,
  Calendar,
} from "lucide-react"

function SimulationSubmittedDetails({ data }) {
  if (!data) return null

  const { product, simulation, simulation_request, technical_documents } = data
  const documents = technical_documents || []

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">
              Simulation Request
            </h2>
            <p className="text-blue-100 mt-1">
              Request successfully submitted
            </p>
          </div>

          <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            {simulation_request?.status}
          </span>
        </div>
      </motion.section>

      {/* ================= PRODUCT DETAILS ================= */}
      <Section
        title="Product Details"
        icon={<Package />}
      >
        <Grid>
          <Field label="EUT Name" value={product?.eut_name} />
          <Field label="Quantity" value={product?.eut_quantity} />
          <Field label="Manufacturer" value={product?.manufacturer} />
          <Field label="Model Number" value={product?.model_no} />
          <Field label="Serial Number" value={product?.serial_no} />
          <Field label="Supply Voltage" value={product?.supply_voltage} />
          <Field label="Operating Frequency" value={product?.operating_frequency} />
          <Field label="Current" value={product?.current} />
          <Field label="Weight" value={product?.weight} />
          <Field
            label="Dimensions (L × W × H)"
            value={
              product?.length_mm && product?.width_mm && product?.height_mm
              ? `${product.length_mm} × ${product.width_mm} × ${product.height_mm} mm`
              : null
            }
          />
          <Field label="Power Ports" value={product?.power_ports} />
          <Field label="Signal Lines" value={product?.signal_lines} />
          <Field
            label="Software"
            value={
              product?.software_name || product?.software_version
                ? `${product?.software_name || ""} ${product?.software_version || ""}`
                : null
            }
          />
          <Field
            label="Industry"
            value={product?.industry?.length ? product.industry.join(", ") : null}
          />
          {product?.industry_other && (
            <Field label="Industry (Other)" value={product.industry_other} />
          )}

        </Grid>

        {product?.notes && (
          <NoteBlock title="Additional Notes" value={product.notes} />
        )}
      </Section>

      {/* ================= SIMULATION DETAILS ================= */}
      <Section
        title="Simulation Details"
        icon={<Cpu />}
      >
        <Grid cols="grid-cols-2">
          <Field label="Product Type" value={simulation?.product_type} />
        </Grid>

        {simulation?.selected_simulations?.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">
              Selected Simulations
            </p>
            <div className="flex flex-wrap gap-2">
              {simulation.selected_simulations.map((sim, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold"
                >
                  {sim}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* ================= DOCUMENTS ================= */}
      <Section
        title="Uploaded Documents"
        icon={<FileText />}
      >
        {documents?.length ? (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.01 }}
                className="flex justify-between items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    {doc.doc_type}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {doc.file_name}
                  </p>
                </div>

                <span className="text-sm text-gray-500">
                  {doc.file_size ? Math.round(doc.file_size / 1024) : 0} KB
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents uploaded</p>
        )}
      </Section>
    </div>
  )
}

/* ================= REUSABLE UI ================= */

function Section({ title, icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
      </div>
      {children}
    </motion.section>
  )
}

function Grid({ children, cols = "grid-cols-2 md:grid-cols-3" }) {
  return (
    <div className={`grid ${cols} gap-6`}>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  if (!value) return null

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="text-base font-semibold text-gray-900 mt-1">
        {value}
      </p>
    </div>
  )
}

function NoteBlock({ title, value }) {
  return (
    <div className="mt-6 rounded-xl bg-gray-50 p-4 border border-gray-200">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        {title}
      </p>
      <p className="text-gray-900 font-medium mt-1">
        {value}
      </p>
    </div>
  )
}

export default SimulationSubmittedDetails
