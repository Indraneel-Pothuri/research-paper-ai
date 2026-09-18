import React from 'react';
import katex from 'katex';

interface MarkdownRendererProps {
  content: string;
  onCitationClick?: (citationIndex: number) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  onCitationClick,
}) => {

  // Render a LaTeX expression using KaTeX.
  const renderMath = (math: string, displayMode: boolean): React.ReactNode => {
    try {
      const html = katex.renderToString(math.trim(), {
        displayMode,
        throwOnError: false,
      });

      return (
        <span
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return displayMode
        ? <div className="font-mono text-sm whitespace-pre-wrap">{math}</div>
        : <code className="font-mono text-xs">{math}</code>;
    }
  };

  // Used for table cells.
  const renderFormattedText = (text: string) => {
    let processed = text;

    // Display math: \[ ... \]
    processed = processed.replace(
      /\\\[([\s\S]*?)\\\]/g,
      (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return `\\[${math}\\]`;
        }
      }
    );

    // Display math: $$ ... $$
    processed = processed.replace(
      /\$\$([\s\S]*?)\$\$/g,
      (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: true,
            throwOnError: false,
          });
        } catch {
          return `$$${math}$$`;
        }
      }
    );

    // Inline math: \( ... \)
    processed = processed.replace(
      /\\\(([\s\S]*?)\\\)/g,
      (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `\\(${math}\\)`;
        }
      }
    );

    // Inline math: $ ... $
    processed = processed.replace(
      /(?<!\$)\$([^$\n]+)\$(?!\$)/g,
      (_, math) => {
        try {
          return katex.renderToString(math.trim(), {
            displayMode: false,
            throwOnError: false,
          });
        } catch {
          return `$${math}$`;
        }
      }
    );

    return processed;
  };

  /*
   * Split the response into normal text and display-math blocks.
   *
   * Supports:
   *   \[ ... \]
   *   $$ ... $$
   *
   * This is important because LLM-generated equations can span
   * multiple lines.
   */
  const splitDisplayMath = (
    input: string
  ): Array<{ type: 'text' | 'math'; content: string }> => {
    const blocks: Array<{ type: 'text' | 'math'; content: string }> = [];

    const regex = /\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(input)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: input.slice(lastIndex, match.index),
        });
      }

      blocks.push({
        type: 'math',
        content: match[1] ?? match[2] ?? '',
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < input.length) {
      blocks.push({
        type: 'text',
        content: input.slice(lastIndex),
      });
    }

    return blocks;
  };

  const renderTextSection = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = '';

    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (key: string) => {
      if (!inTable || tableRows.length === 0) return;

      elements.push(
        <div
          key={key}
          className="my-4 overflow-x-auto rounded-lg border border-academic-200 dark:border-academic-800"
        >
          <table className="min-w-full divide-y divide-academic-200 dark:divide-academic-800 text-sm">
            {tableRows.length > 0 && (
              <thead className="bg-academic-100/70 dark:bg-academic-900/60 font-medium text-academic-700 dark:text-academic-300">
                <tr>
                  {tableRows[0].map((headerCell, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-2 text-left text-xs font-semibold"
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: renderFormattedText(headerCell),
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody className="divide-y divide-academic-100 dark:divide-academic-800/50 bg-white dark:bg-academic-900">
              {tableRows.slice(1).map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-academic-50/50 dark:hover:bg-academic-800/30"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3 py-2 text-xs text-academic-700 dark:text-academic-300"
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: renderFormattedText(cell),
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      inTable = false;
      tableRows = [];
    };

    lines.forEach((line, index) => {

      // -----------------------------
      // Code blocks
      // -----------------------------
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              className="my-3 rounded-lg overflow-hidden bg-academic-900 text-academic-100 font-mono text-xs border border-academic-800"
            >
              <div className="bg-academic-800/80 px-3 py-1.5 text-academic-400 border-b border-academic-700/50 flex justify-between items-center">
                <span>{codeBlockLang || 'code'}</span>

                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      codeBlockContent.join('\n')
                    )
                  }
                  className="hover:text-white transition-colors text-[11px]"
                >
                  Copy
                </button>
              </div>

              <pre className="p-3 overflow-x-auto">
                <code>{codeBlockContent.join('\n')}</code>
              </pre>
            </div>
          );

          codeBlockContent = [];
          codeBlockLang = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.replace('```', '').trim();
        }

        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // -----------------------------
      // Tables
      // -----------------------------
      if (line.includes('|') && line.trim().startsWith('|')) {
        inTable = true;

        const cells = line
          .split('|')
          .map(c => c.trim())
          .filter(
            (_, i, arr) =>
              i !== 0 && i !== arr.length - 1
          );

        // Skip Markdown table separator
        if (line.includes('---')) return;

        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(`table-${index}`);
      }

      // -----------------------------
      // Headings
      // -----------------------------
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={index}
            className="text-xl font-bold mt-5 mb-2 text-academic-900 dark:text-white tracking-tight"
          >
            {renderLineContent(line.substring(2), onCitationClick)}
          </h1>
        );
        return;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="text-lg font-semibold mt-4 mb-2 text-academic-900 dark:text-academic-100 tracking-tight"
          >
            {renderLineContent(line.substring(3), onCitationClick)}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-base font-semibold mt-3 mb-1.5 text-academic-800 dark:text-academic-200"
          >
            {renderLineContent(line.substring(4), onCitationClick)}
          </h3>
        );
        return;
      }

      // -----------------------------
      // Bullet lists
      // -----------------------------
      if (
        line.trim().startsWith('- ') ||
        line.trim().startsWith('* ')
      ) {
        const itemText = line.trim().substring(2);

        elements.push(
          <li
            key={index}
            className="ml-4 list-disc text-sm text-academic-700 dark:text-academic-300 my-0.5"
          >
            {renderLineContent(itemText, onCitationClick)}
          </li>
        );

        return;
      }

      // -----------------------------
      // Numbered lists
      // -----------------------------
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);

      if (numMatch) {
        elements.push(
          <li
            key={index}
            className="ml-4 list-decimal text-sm text-academic-700 dark:text-academic-300 my-0.5"
          >
            {renderLineContent(numMatch[2], onCitationClick)}
          </li>
        );

        return;
      }

      // -----------------------------
      // Empty lines
      // -----------------------------
      if (!line.trim()) {
        elements.push(
          <div
            key={index}
            className="h-2"
          />
        );

        return;
      }

      // -----------------------------
      // Regular paragraph
      // -----------------------------
      elements.push(
        <p
          key={index}
          className="text-sm leading-relaxed text-academic-800 dark:text-academic-200 my-1"
        >
          {renderLineContent(line, onCitationClick)}
        </p>
      );
    });

    // Flush a table if the text ends while still inside one.
    if (inTable) {
      flushTable('table-final');
    }

    return elements;
  };

  /*
   * First split the entire response into:
   *
   *   normal Markdown text
   *   display LaTeX
   *   normal Markdown text
   *
   * This allows equations such as:
   *
   * \[
   * L_CLIP = ...
   * \]
   *
   * to span multiple lines.
   */
  const blocks = splitDisplayMath(content);

  return (
    <div className="space-y-1 font-sans">
      {blocks.map((block, index) => {
        if (block.type === 'math') {
          return (
            <div
              key={`display-math-${index}`}
              className="my-4 overflow-x-auto text-center"
            >
              {renderMath(block.content, true)}
            </div>
          );
        }

        return (
          <React.Fragment key={`text-${index}`}>
            {renderTextSection(block.content)}
          </React.Fragment>
        );
      })}
    </div>
  );
};


// ============================================================
// Inline Markdown + Inline LaTeX renderer
// ============================================================

function renderLineContent(
  text: string,
  onCitationClick?: (num: number) => void
): React.ReactNode {

  /*
   * Supports:
   *
   * [1]          citations
   * **text**     bold
   * \( ... \)    inline LaTeX
   * $ ... $      inline LaTeX
   *
   * Display equations \[...\] and $$...$$ are handled
   * separately before this function is called.
   */
  const parts = text.split(
    /(\[\d+\]|\\\([\s\S]*?\\\)|(?<!\$)\$[^$\n]+\$(?!\$)|\*\*.*?\*\*)/g
  );

  return parts.map((part, idx) => {
    if (!part) return null;

    // -----------------------------
    // Citation [1]
    // -----------------------------
    const citeMatch = part.match(/^\[(\d+)\]$/);

    if (citeMatch) {
      const citeNum = parseInt(citeMatch[1], 10);

      return (
        <button
          key={idx}
          onClick={() =>
            onCitationClick && onCitationClick(citeNum)
          }
          className="inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 rounded hover:bg-brand-100 dark:hover:bg-brand-900 transition-colors cursor-pointer"
          title={`View Source [${citeNum}]`}
        >
          [{citeNum}]
        </button>
      );
    }

    // -----------------------------
    // Bold
    // -----------------------------
    if (
      part.startsWith('**') &&
      part.endsWith('**')
    ) {
      const inner = part.slice(2, -2);

      return (
        <strong
          key={idx}
          className="font-semibold text-academic-900 dark:text-white"
        >
          {inner}
        </strong>
      );
    }

    // -----------------------------
    // Inline LaTeX: \( ... \)
    // -----------------------------
    if (
      part.startsWith('\\(') &&
      part.endsWith('\\)')
    ) {
      const mathStr = part.slice(2, -2);

      try {
        const html = katex.renderToString(
          mathStr.trim(),
          {
            displayMode: false,
            throwOnError: false,
          }
        );

        return (
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <code
            key={idx}
            className="font-mono text-xs bg-academic-100 dark:bg-academic-800 px-1 py-0.5 rounded"
          >
            {part}
          </code>
        );
      }
    }

    // -----------------------------
    // Inline LaTeX: $ ... $
    // -----------------------------
    if (
      part.startsWith('$') &&
      part.endsWith('$') &&
      !part.startsWith('$$')
    ) {
      const mathStr = part.slice(1, -1);

      try {
        const html = katex.renderToString(
          mathStr.trim(),
          {
            displayMode: false,
            throwOnError: false,
          }
        );

        return (
          <span
            key={idx}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <code
            key={idx}
            className="font-mono text-xs bg-academic-100 dark:bg-academic-800 px-1 py-0.5 rounded"
          >
            {part}
          </code>
        );
      }
    }

    return part;
  });
}