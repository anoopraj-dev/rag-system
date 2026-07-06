function buildPrompt({question,context}){
    const contextText = context.
        map((chunk,index)=>{
            return `Chunk${index+1}:\n${chunk.text}`
        })
        .join('\n\n');

        return `
You are Cortex, an AI assistant.

Answer ONLY using the provided context.
If the answer is not in the context, say:
"I couldn't find that information in the uploaded documents."

---

CONTEXT:
${contextText}

---

QUESTION:
${question}
  `.trim();
}

export default buildPrompt;