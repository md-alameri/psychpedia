'use client';

interface Reference {
  id: string;
  citation: string;
  url?: string;
}

interface ReferenceListProps {
  references: Reference[];
}

/**
 * Component for displaying medical references
 */
export default function ReferenceList({ references }: ReferenceListProps) {
  if (!references || references.length === 0) {
    return null;
  }
  
  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold text-text-primary mb-4">References</h3>
      <ol className="list-decimal list-inside space-y-3">
        {references.map((ref) => (
          <li key={ref.id} className="text-text-secondary">
            {ref.url ? (
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-light underline"
              >
                {ref.citation}
              </a>
            ) : (
              <span>{ref.citation}</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

