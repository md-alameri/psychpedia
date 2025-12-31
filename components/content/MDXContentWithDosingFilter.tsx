import MDXContent from './MDXContent';

interface MDXContentWithDosingFilterProps {
  source: string;
  hideDosing: boolean;
}

/**
 * Wrapper component that filters out dosing sections for public pages
 */
export default function MDXContentWithDosingFilter({ source, hideDosing }: MDXContentWithDosingFilterProps) {
  if (!hideDosing) {
    return <MDXContent source={source} />;
  }
  
  // Remove dosing section from MDX content for public pages
  // This is a simple regex-based approach - in production, you might want
  // a more sophisticated MDX AST-based solution
  const filteredSource = source.replace(
    /## Dosing[\s\S]*?(?=## |$)/gi,
    (match) => {
      return `## Dosing\n\n*Dosing information is available to registered healthcare professionals.*\n\n`;
    }
  );
  
  return <MDXContent source={filteredSource} />;
}

