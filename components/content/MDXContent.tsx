import { MDXRemote } from 'next-mdx-remote/rsc';
import type { MDXComponents } from 'mdx/types';
import MedicalWarning from './MedicalWarning';
import ReferenceList from './ReferenceList';
import DosingTable from './DosingTable';

/**
 * Custom MDX components for medical content
 */
const mdxComponents: MDXComponents = {
  // Headings
  h1: ({ children, ...props }) => (
    <h1 className="text-4xl font-semibold text-text-primary mb-6 mt-8" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-3xl font-semibold text-text-primary mb-4 mt-8" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-2xl font-semibold text-text-primary mb-3 mt-6" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-xl font-semibold text-text-primary mb-2 mt-4" {...props}>
      {children}
    </h4>
  ),
  
  // Paragraphs
  p: ({ children, ...props }) => (
    <p className="text-base text-text-secondary leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  
  // Lists
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside space-y-2 mb-4 text-text-secondary" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside space-y-2 mb-4 text-text-secondary" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="ml-4 rtl:mr-4" {...props}>
      {children}
    </li>
  ),
  
  // Links
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-accent hover:text-accent-light underline"
      {...props}
    >
      {children}
    </a>
  ),
  
  // Tables
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-background-off" {...props}>
      {children}
    </thead>
  ),
  tbody: ({ children, ...props }) => (
    <tbody {...props}>
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="border-b border-border" {...props}>
      {children}
    </tr>
  ),
  th: ({ children, ...props }) => (
    <th className="px-4 py-3 text-left rtl:text-right font-semibold text-text-primary" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="px-4 py-3 text-text-secondary" {...props}>
      {children}
    </td>
  ),
  
  // Blockquotes
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-accent pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 bg-background-off rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none"
      {...props}
    >
      {children}
    </blockquote>
  ),
  
  // Code
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-background-off px-1.5 py-0.5 rounded text-sm font-mono text-text-primary" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }) => (
    <pre className="bg-background-off p-4 rounded-lg overflow-x-auto my-6" {...props}>
      {children}
    </pre>
  ),
  
  // Horizontal rule
  hr: ({ ...props }) => (
    <hr className="my-8 border-border" {...props} />
  ),
  
  // Strong/emphasis
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-text-primary" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  
  // Custom medical components
  MedicalWarning,
  ReferenceList,
  DosingTable,
};

interface MDXContentProps {
  source: string;
}

/**
 * Client component to render MDX content
 */
export default function MDXContent({ source }: MDXContentProps) {
  return (
    <div className="prose prose-medical max-w-none">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}

