Using only verified information you already know about me from our conversations and any materials I have explicitly provided, prepare my personal brand details for use in professional visual templates.

REQUIREMENTS

1\. Identity and accuracy  
\- Use my information exclusively.  
\- Accurately reflect my actual professional title, specialization, experience, and skills.  
\- Do not invent or exaggerate qualifications, certifications, achievements, testimonials, ratings, client counts, or professional affiliations.  
\- Preserve the correct spelling and capitalization of my name.

2\. Professional copy  
\- Write all content in polished, natural English.  
\- Create concise, compelling headlines, a short professional bio, and relevant calls to action grounded in my verified background.  
\- Keep the wording suitable for professional banners, profile graphics, and personal brand templates.  
\- Avoid generic buzzwords, unsupported claims, and language that implies services or availability I have not confirmed.  
\- Include up to three verified core skills, prioritizing those most relevant to my professional identity.  
\- Populate OPTIONAL\_ADDITIONAL\_TEXT only when a relevant, verified detail adds clear value.

3\. Brand colors  
\- Use my exact brand color codes if they are known.  
\- Otherwise, select a cohesive, professional three-color palette appropriate to my field.  
\- Provide each color as a six-digit HEX string in the format "\#RRGGBB".  
\- PRIMARY\_COLOR: A distinctive accent color for highlights, buttons, emphasized words, and focal points.  
\- SECONDARY\_COLOR: A light color for main backgrounds and clean surfaces.  
\- TERTIARY\_COLOR: A dark color for dark backgrounds, structural elements, cards, borders, and supporting contrast.  
\- Choose colors that support readable typography and strong contrast when applied appropriately.

4\. Unknown information  
\- Never guess my website, portfolio URL, contact details, or social media handle.  
\- Use an empty string ("") for any unknown text value.  
\- Include only verified skills in the skills array. If none are known, return an empty array (\[\]).  
\- Do not insert placeholders, sample information, "N/A", "Unknown", or explanatory notes.  
\- Do not ask follow-up questions.

OUTPUT CONTRACT

\- Return exactly one valid JSON object.  
\- Use the exact keys and order shown below.  
\- All values must be strings, except KEYWORDS / SKILLS, which must be an array of up to three strings.  
\- Preserve every key, including keys with empty values.  
\- Use standard JSON syntax with double-quoted keys and string values.  
\- Escape quotation marks, backslashes, and control characters correctly.  
\- Do not include comments, trailing commas, Markdown formatting, code fences, or text outside the JSON object.  
\- Do not add additional keys.  
\- Replace the empty values below with the appropriate content.  
\- Validate the JSON syntax before returning it.

{  
  "PRIMARY\_COLOR": "",  
  "SECONDARY\_COLOR": "",  
  "TERTIARY\_COLOR": "",  
  "FULL\_NAME": "",  
  "PROFESSIONAL\_TITLE": "",  
  "SPECIALIZATION": "",  
  "MAIN\_HEADLINE": "",  
  "SECONDARY\_HEADLINE": "",  
  "SHORT\_BIO": "",  
  "KEYWORDS / SKILLS": \[\],  
  "PRIMARY\_CALL\_TO\_ACTION": "",  
  "SECONDARY\_CALL\_TO\_ACTION": "",  
  "PORTFOLIO\_URL": "",  
  "CONTACT\_TEXT": "",  
  "SOCIAL\_HANDLE": "",  
  "OPTIONAL\_ADDITIONAL\_TEXT": ""  
}

