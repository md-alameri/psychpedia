'use client';

import React from 'react';
import type { Locale } from '@/lib/content/types';
import WarningCallout from './blocks/WarningCallout';
import UrgentCare from './blocks/UrgentCare';
import StudentHighlights from './blocks/StudentHighlights';
import DosingBlock from './blocks/DosingBlock';
import References from './blocks/References';

interface RichTextRendererProps {
  content: any; // Payload richText JSON
  locale: Locale;
  audience?: 'public' | 'student' | 'clinician';
  hideDosing?: boolean;
}

/**
 * Payload richText JSON structure:
 * {
 *   root: {
 *     children: [
 *       { type: 'p', children: [{ text: 'Hello' }] },
 *       { type: 'h2', children: [{ text: 'World' }] },
 *       { type: 'warningCallout', variant: 'warning', ... }
 *     ],
 *     type: 'root'
 *   }
 * }
 */

// Helper function to generate deterministic keys
function generateKey(node: any, index?: number, parentPath?: string): string {
  if (node.id) {
    return node.id;
  }
  // Use deterministic key based on node type, index, and content hash
  const path = parentPath ? `${parentPath}-${index}` : String(index ?? 0);
  const type = node.type || 'text';
  const contentHash = node.text ? node.text.substring(0, 10) : '';
  return `${type}-${path}-${contentHash}`;
}

function renderNode(node: any, locale: Locale, audience: 'public' | 'student' | 'clinician' = 'public', hideDosing: boolean = false, index: number = 0, parentPath: string = ''): React.ReactNode {
  if (!node) return null;

  const nodeKey = generateKey(node, index, parentPath);
  const currentPath = parentPath ? `${parentPath}-${index}` : String(index);

  // Handle text nodes
  if (node.text !== undefined) {
    // Apply formatting
    let text = node.text;
    if (node.bold) {
      text = <strong key={`${nodeKey}-bold`}>{text}</strong>;
    }
    if (node.italic) {
      text = <em key={`${nodeKey}-italic`}>{text}</em>;
    }
    if (node.underline) {
      text = <u key={`${nodeKey}-underline`}>{text}</u>;
    }
    if (node.strikethrough) {
      text = <s key={`${nodeKey}-strikethrough`}>{text}</s>;
    }
    if (node.code) {
      text = <code key={`${nodeKey}-code`} className="bg-background-off px-1.5 py-0.5 rounded text-sm font-mono text-text-primary">{text}</code>;
    }
    return text;
  }

  // Handle element nodes
  const children = node.children?.map((child: any, childIndex: number) => 
    renderNode(child, locale, audience, hideDosing, childIndex, currentPath)
  ) || [];

  switch (node.type) {
    case 'root':
      return (
        <div key="root" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
          {children}
        </div>
      );

    case 'p':
      return (
        <p key={nodeKey} className="text-base text-text-secondary leading-relaxed mb-4">
          {children}
        </p>
      );

    case 'h1':
      return (
        <h1 key={nodeKey} className="text-4xl font-semibold text-text-primary mb-6 mt-8">
          {children}
        </h1>
      );

    case 'h2':
      return (
        <h2 key={nodeKey} className="text-3xl font-semibold text-text-primary mb-4 mt-8">
          {children}
        </h2>
      );

    case 'h3':
      return (
        <h3 key={nodeKey} className="text-2xl font-semibold text-text-primary mb-3 mt-6">
          {children}
        </h3>
      );

    case 'h4':
      return (
        <h4 key={nodeKey} className="text-xl font-semibold text-text-primary mb-2 mt-4">
          {children}
        </h4>
      );

    case 'h5':
      return (
        <h5 key={nodeKey} className="text-lg font-semibold text-text-primary mb-2 mt-4">
          {children}
        </h5>
      );

    case 'h6':
      return (
        <h6 key={nodeKey} className="text-base font-semibold text-text-primary mb-2 mt-4">
          {children}
        </h6>
      );

    case 'ul':
      return (
        <ul key={nodeKey} className="list-disc list-inside space-y-2 mb-4 text-text-secondary rtl:list-outside rtl:mr-6">
          {children}
        </ul>
      );

    case 'ol':
      return (
        <ol key={nodeKey} className="list-decimal list-inside space-y-2 mb-4 text-text-secondary rtl:list-outside rtl:mr-6">
          {children}
        </ol>
      );

    case 'li':
      return (
        <li key={nodeKey} className="ml-4 rtl:mr-4">
          {children}
        </li>
      );

    case 'link':
      return (
        <a
          key={nodeKey}
          href={node.url || node.href || '#'}
          className="text-accent hover:text-accent-light underline"
          target={node.newTab ? '_blank' : undefined}
          rel={node.newTab ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );

    case 'blockquote':
      return (
        <blockquote
          key={nodeKey}
          className="border-l-4 rtl:border-l-0 rtl:border-r-4 border-accent pl-6 pr-6 rtl:pl-6 rtl:pr-6 py-4 my-6 bg-background-off rounded-r-lg rtl:rounded-l-lg rtl:rounded-r-none"
        >
          {children}
        </blockquote>
      );

    case 'code':
      return (
        <pre key={nodeKey} className="bg-background-off p-4 rounded-lg overflow-x-auto my-6">
          <code>{children}</code>
        </pre>
      );

    case 'hr':
      return <hr key={nodeKey} className="my-8 border-border" />;

    // Custom blocks
    case 'warningCallout':
      return (
        <WarningCallout
          key={nodeKey}
          variant={node.variant || 'warning'}
          title={node.title}
          text={node.text}
          locale={locale}
        />
      );

    case 'urgentCare':
      return (
        <UrgentCare
          key={nodeKey}
          items={node.items || []}
          locale={locale}
        />
      );

    case 'studentHighlights':
      return (
        <StudentHighlights
          key={nodeKey}
          highYieldPoints={node.highYieldPoints}
          differentials={node.differentials}
          examTips={node.examTips}
          locale={locale}
        />
      );

    case 'dosingBlock':
      return (
        <DosingBlock
          key={nodeKey}
          doseText={node.doseText}
          audience={node.audience || 'clinician'}
          locale={locale}
          hideDosing={hideDosing}
        />
      );

    case 'references':
      return (
        <References
          key={nodeKey}
          references={node.references || []}
          locale={locale}
        />
      );

    default:
      // Fallback for unknown node types
      console.warn(`Unknown node type: ${node.type}`);
      return <div key={nodeKey}>{children}</div>;
  }
}

/**
 * RichTextRenderer component for rendering Payload CMS richText JSON
 */
export default function RichTextRenderer({ content, locale, audience = 'public', hideDosing = false }: RichTextRendererProps) {
  if (!content) {
    return null;
  }

  // Handle both direct root and nested root structures
  const root = content.root || content;
  
  if (!root || !root.children) {
    return null;
  }

  return (
    <div className="prose prose-medical max-w-none" dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      {root.children.map((child: any, index: number) => 
        renderNode(child, locale, audience, hideDosing, index, 'root')
      )}
    </div>
  );
}

