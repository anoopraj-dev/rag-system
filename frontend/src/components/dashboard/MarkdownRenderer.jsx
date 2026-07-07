import React from "react";

export default function MarkdownRenderer({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const renderedElements = [];
  let inCodeBlock = false;
  let codeBlockLines = [];
  let inList = false;
  let listItems = [];

  const parseInline = (str) => {
    let html = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    html = html.replace(/`([^`]+)`/g, '<code class="bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs text-indigo-300">$1</code>');

    return html;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inList) {
        renderedElements.push(
          <ul key={`list-${i}`} className="list-disc pl-5 my-2 space-y-1 text-zinc-300 text-base">
            {...listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }

      if (inCodeBlock) {
        const codeContent = codeBlockLines.join("\n");
        renderedElements.push(
          <pre key={`code-${i}`} className="bg-zinc-950 p-3 border border-zinc-850 rounded-xl my-2 overflow-x-auto text-sm font-mono text-indigo-300 whitespace-pre">
            <code>{codeContent}</code>
          </pre>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      inList = true;
      const content = listMatch[1];
      const parsedContent = parseInline(content);
      listItems.push(
        <li key={`li-${i}`} dangerouslySetInnerHTML={{ __html: parsedContent }} />
      );
      continue;
    }

    if (inList && !listMatch) {
      renderedElements.push(
        <ul key={`list-${i}`} className="list-disc pl-5 my-2 space-y-1 text-zinc-300 text-base">
          {...listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }

    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const parsedContent = parseInline(content);
      const classes = level === 1 ? "text-xl font-bold text-white mt-4 mb-2" : level === 2 ? "text-lg font-bold text-white mt-3 mb-1.5" : "text-base font-semibold text-white mt-2.5 mb-1";
      renderedElements.push(
        <div key={i} className={classes} dangerouslySetInnerHTML={{ __html: parsedContent }} />
      );
      continue;
    }

    if (line.trim() === "") {
      renderedElements.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }

    const parsedLine = parseInline(line);
    renderedElements.push(
      <p key={i} className="text-zinc-200 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: parsedLine }} />
    );
  }

  if (inList) {
    renderedElements.push(
      <ul key="list-final" className="list-disc pl-5 my-2 space-y-1 text-zinc-300 text-base">
        {...listItems}
      </ul>
    );
  }

  return <div className="space-y-1.5">{renderedElements}</div>;
}
