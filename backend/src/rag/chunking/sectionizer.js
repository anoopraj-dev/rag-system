//Identify headings and extract
function isHeading(line) {
  return /^#{1,6}\s/.test(line.trim());
}

function extractHeading(line) {
  return line.trim().replace(/^#{1,6}\s/, "");
}

//sectionizer
function sectionize(text) {
  const lines = text.split('\n');

  const sections = [];

  let currentSection = {
    title: 'Untitled',
    content: [],
  };

  for (const line of lines) {
    if (isHeading(line)) {
      //push previous sections
      if (currentSection.content.length > 0) {
        sections.push({
          title: currentSection.title,
          text: currentSection.content.join('\n').trim(),
        })
      }

      //start new section 
      currentSection = {
        title: extractHeading(line),
        content: [],
      }
    } else {
      currentSection.content.push(line);
    }
  }

  //push last section 
  if (currentSection.content.length > 0) {
    sections.push({
      title: currentSection.title,
      text: currentSection.content.join('\n').trim()
    })
  }

  return sections

}

export default sectionize;
