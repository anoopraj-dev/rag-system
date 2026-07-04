// Identify headings and extract
function isHeading(line) {
  return /^#{1,6}\s/.test(line.trim());
}

function extractHeading(line) {
  return line.trim().replace(/^#{1,6}\s/, "");
}

// Sectionize text by headings
function sectionize(text) {
  if (!text) return [];
  
  const lines = text.split('\n');
  const sections = [];

  let currentSection = {
    title: 'Untitled',
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
