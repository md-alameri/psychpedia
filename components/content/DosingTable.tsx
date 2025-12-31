'use client';

interface DosingRow {
  population: string;
  initial?: string;
  maintenance?: string;
  maximum?: string;
  notes?: string;
}

interface DosingTableProps {
  title?: string;
  rows: DosingRow[];
}

/**
 * Specialized table component for medication dosing information
 */
export default function DosingTable({ title, rows }: DosingTableProps) {
  return (
    <div className="my-6">
      {title && (
        <h4 className="text-xl font-semibold text-text-primary mb-3">{title}</h4>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-border">
          <thead className="bg-background-off">
            <tr>
              <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary border-b border-border">
                Population
              </th>
              <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary border-b border-border">
                Initial Dose
              </th>
              <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary border-b border-border">
                Maintenance Dose
              </th>
              <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary border-b border-border">
                Maximum Dose
              </th>
              <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary border-b border-border">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-border">
                <td className="px-4 py-3 text-text-primary font-medium">{row.population}</td>
                <td className="px-4 py-3 text-text-secondary">{row.initial || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{row.maintenance || '—'}</td>
                <td className="px-4 py-3 text-text-secondary">{row.maximum || '—'}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{row.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

