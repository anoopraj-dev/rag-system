// Identify headings and extract
function isHeading(line) {
  const trimmed = line.trim();
  if (/^#{1,6}\s/.test(trimmed)) return true;
  
  // Numbered headers: "1. Introduction" or "1.2. React Hooks" (max 50 chars)
  if (/^\d+(\.\d+)*\.?\s+[A-Z][A-Za-z0-9\s:-]{1,50}$/.test(trimmed)) return true;
  
  // Standard short uppercase headers: "INTRODUCTION", "GETTING STARTED" (max 40 chars)
  if (/^[A-Z][A-Z0-9\s:-]{2,40}$/.test(trimmed)) return true;
  
  return false;
}

function extractHeading(line) {
  return line.trim().replace(/^#{1,6}\s/, "");
}

// Sectionize text by headings
function sectionize(text, defaultTitle = 'Untitled') {
  if (!text) return [];
  
  const lines = text.split('\n');
  const sections = [];

  let currentSection = {
    title: defaultTitle,
    content: [],
  };

  for (const line of lines) {
    if (isHeading(line)) {
      // Push previous section
      if (currentSection.content.length > 0) {
        sections.push({
          title: currentSection.title,
          text: currentSection.content.join('\n').trim(),
        });
      }

      // Start new section 
      currentSection = {
        title: extractHeading(line),
        content: [],
      };
    } else {
      currentSection.content.push(line);
    }
  }

  // Push last section 
  if (currentSection.content.length > 0) {
    sections.push({
      title: currentSection.title,
      text: currentSection.content.join('\n').trim(),
    });
  }

  return sections;
}

export default sectionize;
