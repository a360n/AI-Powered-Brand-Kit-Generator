// Conditional Popover Polyfill check per modern-web-guidance (persistent-toast-notifications)
if (typeof HTMLElement !== "undefined" && !("popover" in HTMLElement.prototype)) {
  import("https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js").catch(() => {});
}

// Step 1 Prompt (Clean version of Personal_Brand_Details_JSON_Prompt.md)
const STEP_1_PROMPT = `Using only verified information you already know about me from our conversations and any materials I have explicitly provided, prepare my personal brand details for use in professional visual templates.

REQUIREMENTS

1. Identity and accuracy
- Use my information exclusively.
- Accurately reflect my actual professional title, specialization, experience, and skills.
- Do not invent or exaggerate qualifications, certifications, achievements, testimonials, ratings, client counts, or professional affiliations.
- Preserve the correct spelling and capitalization of my name.

2. Professional copy
- Write all content in polished, natural English.
- Create concise, compelling headlines, a short professional bio, and relevant calls to action grounded in my verified background.
- Keep the wording suitable for professional banners, profile graphics, and personal brand templates.
- Avoid generic buzzwords, unsupported claims, and language that implies services or availability I have not confirmed.
- Include up to three verified core skills, prioritizing those most relevant to my professional identity.
- Populate OPTIONAL_ADDITIONAL_TEXT only when a relevant, verified detail adds clear value.

3. Brand colors
- Use my exact brand color codes if they are known.
- Otherwise, select a cohesive, professional three-color palette appropriate to my field.
- Provide each color as a six-digit HEX string in the format "#RRGGBB".
- PRIMARY_COLOR: A distinctive accent color for highlights, buttons, emphasized words, and focal points.
- SECONDARY_COLOR: A light color for main backgrounds and clean surfaces.
- TERTIARY_COLOR: A dark color for dark backgrounds, structural elements, cards, borders, and supporting contrast.
- Choose colors that support readable typography and strong contrast when applied appropriately.

4. Unknown information
- Never guess my website, portfolio URL, contact details, or social media handle.
- Use an empty string ("") for any unknown text value.
- Include only verified skills in the skills array. If none are known, return an empty array ([]).
- Do not insert placeholders, sample information, "N/A", "Unknown", or explanatory notes.
- Do not ask follow-up questions.

OUTPUT CONTRACT

- Return exactly one valid JSON object.
- Use the exact keys and order shown below.
- All values must be strings, except KEYWORDS / SKILLS, which must be an array of up to three strings.
- Preserve every key, including keys with empty values.
- Use standard JSON syntax with double-quoted keys and string values.
- Escape quotation marks, backslashes, and control characters correctly.
- Do not include comments, trailing commas, Markdown formatting, code fences, or text outside the JSON object.
- Do not add additional keys.
- Replace the empty values below with the appropriate content.
- Validate the JSON syntax before returning it.

{
  "PRIMARY_COLOR": "",
  "SECONDARY_COLOR": "",
  "TERTIARY_COLOR": "",
  "FULL_NAME": "",
  "PROFESSIONAL_TITLE": "",
  "SPECIALIZATION": "",
  "MAIN_HEADLINE": "",
  "SECONDARY_HEADLINE": "",
  "SHORT_BIO": "",
  "KEYWORDS / SKILLS": [],
  "PRIMARY_CALL_TO_ACTION": "",
  "SECONDARY_CALL_TO_ACTION": "",
  "PORTFOLIO_URL": "",
  "CONTACT_TEXT": "",
  "SOCIAL_HANDLE": "",
  "OPTIONAL_ADDITIONAL_TEXT": ""
}`;

// Default / Empty Brand State
const DEFAULT_BRAND_DATA = {
  PRIMARY_COLOR: "#C3FF01",
  SECONDARY_COLOR: "#F4F4F4",
  TERTIARY_COLOR: "#151515",
  FULL_NAME: "",
  PROFESSIONAL_TITLE: "",
  SPECIALIZATION: "",
  MAIN_HEADLINE: "",
  SECONDARY_HEADLINE: "",
  SHORT_BIO: "",
  "KEYWORDS / SKILLS": [],
  PRIMARY_CALL_TO_ACTION: "",
  SECONDARY_CALL_TO_ACTION: "",
  PORTFOLIO_URL: "",
  CONTACT_TEXT: "",
  SOCIAL_HANDLE: "",
  OPTIONAL_ADDITIONAL_TEXT: ""
};

// Demo Brand Data (Showcasing Ali Nasser!)
const DEMO_BRAND_DATA = {
  PRIMARY_COLOR: "#C3FF01",
  SECONDARY_COLOR: "#F4F4F4",
  TERTIARY_COLOR: "#151515",
  FULL_NAME: "Ali Nasser",
  PROFESSIONAL_TITLE: "Software Engineer & AI Solutions Builder",
  SPECIALIZATION: "AI Agents, Modern Web Architecture & Developer Workflows",
  MAIN_HEADLINE: "Building Intelligent Software & AI Systems That Deliver Real Impact",
  SECONDARY_HEADLINE: "Turning complex workflows into clean, scalable digital products",
  SHORT_BIO: "Software developer focused on practical AI engineering, modern full-stack web applications, and automated digital systems.",
  "KEYWORDS / SKILLS": [
    "AI Engineering",
    "Full-Stack Web Dev",
    "System Architecture"
  ],
  PRIMARY_CALL_TO_ACTION: "Explore My Portfolio",
  SECONDARY_CALL_TO_ACTION: "Let's Connect & Collaborate",
  PORTFOLIO_URL: "www.ali-nasser.dev",
  CONTACT_TEXT: "linkedin.com/in/ali-nasser-dev",
  SOCIAL_HANDLE: "@ali-nasser-dev",
  OPTIONAL_ADDITIONAL_TEXT: "github.com/a360n"
};

let currentBrandData = structuredClone(DEFAULT_BRAND_DATA);
let currentLang = "ar";
let toastTimeout = null;
let selectedUserPhotoFile = null;

// Build Master Prompt with Injected Values
function buildMasterPrompt(data) {
  const v = (key, fallback = "") => {
    const val = data[key];
    return typeof val === "string" && val.trim() !== "" ? val.trim() : fallback;
  };

  const skillsRaw = Array.isArray(data["KEYWORDS / SKILLS"])
    ? data["KEYWORDS / SKILLS"].map((s) => String(s).trim()).filter(Boolean)
    : [];

  const skillsLines =
    skillsRaw.length > 0
      ? skillsRaw.slice(0, 3).map((s) => `* ${s}`).join("\n")
      : `* [No specific skills listed — rebalance layout gracefully]`;

  const primaryColor = v("PRIMARY_COLOR", "#C3FF01");
  const secondaryColor = v("SECONDARY_COLOR", "#F4F4F4");
  const tertiaryColor = v("TERTIARY_COLOR", "#151515");

  const primaryCTA = v("PRIMARY_CALL_TO_ACTION", "");
  const secondaryCTA = v("SECONDARY_CALL_TO_ACTION", "");
  const portfolioUrl = v("PORTFOLIO_URL", "");
  const contactText = v("CONTACT_TEXT", "");

  return `# **MASTER PROMPT — AI PERSONAL BRANDING DESIGN SYSTEM**

## **ROLE & OBJECTIVE**

Act as a **Senior Brand Identity Designer, Creative Director, LinkedIn Personal Branding Specialist, and Professional Digital Graphic Designer** with extensive experience creating premium, cohesive visual identity systems.

Your mission is to create a complete, professional, visually consistent **Personal Branding Design Kit** based on the reference design image attached to this prompt.

The reference image establishes the desired design language, layout composition, typography hierarchy, portrait placement, lighting effects, gradients, visual rhythm, and overall creative direction.

**Important:** Recreate the reference's design system and visual structure as closely as possible, while replacing its original person, colors, text, and branding with the user's customized information.

The final designs must look like a professionally art-directed branding project, not generic AI-generated templates.

---

# **SECTION 1 — USER INPUTS**

The user must complete the following fields before generating the designs.

## **1.1 Personal Photograph**

**USER_PHOTO:** USER_PHOTO [ATTACHED PERSONAL PHOTOGRAPH]

Use the uploaded photograph as the primary visual identity reference.

Photograph requirements:

* Preserve the person's recognizable facial identity.
* Maintain natural facial proportions and skin texture.
* Preserve realistic eyes, nose, mouth, hairstyle, and facial structure.
* Professionally isolate the subject from the original background.
* Improve lighting, sharpness, and visual consistency when needed.
* Adapt the subject's placement, crop, and pose to the reference layouts.
* Preserve the original clothing unless a change is explicitly requested.
* Avoid artificial facial reconstruction, excessive retouching, or identity alteration.

The same person must appear consistently across all templates.

## **1.2 Brand Color Palette**

Replace ALL original reference colors with these three user-defined colors.

**PRIMARY_COLOR:** \`${primaryColor}\`

**SECONDARY_COLOR:** \`${secondaryColor}\`

**TERTIARY_COLOR:** \`${tertiaryColor}\`

Color application rules:

* Primary: Brand accents, highlights, buttons, emphasized words, and visual focal points.
* Secondary: Main backgrounds, clean surfaces, text contrast, and secondary elements.
* Tertiary: Dark backgrounds, structural elements, cards, borders, and supporting contrast.

You may create lighter and darker tonal variations of these colors to produce depth, gradients, shadows, and lighting effects.

Do not introduce unrelated brand colors.

Maintain professional accessibility, strong contrast, and readable typography.

## **1.3 Personal Brand Information**

**FULL_NAME:** ${v("FULL_NAME")}

**PROFESSIONAL_TITLE:** ${v("PROFESSIONAL_TITLE")}

**SPECIALIZATION:** ${v("SPECIALIZATION")}

**MAIN_HEADLINE:** ${v("MAIN_HEADLINE")}

**SECONDARY_HEADLINE:** ${v("SECONDARY_HEADLINE")}

**SHORT_BIO:** ${v("SHORT_BIO")}

**KEYWORDS / SKILLS:**

${skillsLines}

**PRIMARY_CALL_TO_ACTION:** ${primaryCTA}

**SECONDARY_CALL_TO_ACTION:** ${secondaryCTA}

**PORTFOLIO_URL:** ${portfolioUrl}

**CONTACT_TEXT:** ${contactText}

**SOCIAL_HANDLE:** ${v("SOCIAL_HANDLE")}

**OPTIONAL_ADDITIONAL_TEXT:** ${v("OPTIONAL_ADDITIONAL_TEXT")}

Use the exact information provided.

Do not invent qualifications, testimonials, achievements, ratings, client counts, certifications, or contact details.

If a field is empty, omit it gracefully and rebalance the composition.

---

# **SECTION 2 — DESIGN REFERENCE**

**REFERENCE_IMAGE:** REFERENCE_IMAGE.JPG [ATTACHED DESIGN REFERENCE]

Study the reference image carefully before producing any designs.

Extract and reproduce its key visual characteristics:

1. Minimalist, high-impact personal branding.
2. Modern geometric sans-serif typography.
3. Oversized headlines with strategic emphasis.
4. Professional portrait cutouts integrated into the composition.
5. Bright accent lighting and smooth atmospheric gradients.
6. Strong contrast between dark and light surfaces.
7. Clean, intentional spacing and alignment.
8. Small pill-shaped skill labels and category tags.
9. Premium editorial graphic design.
10. Cohesive visual identity across all deliverables.

Preserve the reference's visual hierarchy and composition, but use the user's colors, photograph, and content.

Do not reproduce the original model, name, slogans, or branding.

---

# **SECTION 3 — REQUIRED DESIGN DELIVERABLES**

Create the following complete design collection.

## **DESIGN 01 — Brand Color Palette**

Create a professional three-color brand palette presentation.

Include:

* Three large rectangular color swatches.
* Primary, secondary, and tertiary color labels.
* Exact HEX codes.
* Correct RGB values calculated from the HEX codes.
* Minimalist presentation matching the reference.

## **DESIGN 02 — LinkedIn Banner (Light Version)**

**Canvas: 1584 × 396 px**

Create a premium LinkedIn profile banner inspired by the reference's light composition.

Layout:

* Left: Small professional CTA or identity element.
* Center: Professional title and prominent headline.
* Below headline: Three skill/category pills.
* Right: Large, professionally isolated portrait.
* Background: Light surface with subtle geometric texture.
* Accent: Controlled gradient lighting using the primary brand color.

Keep the most important text away from the lower-left area where LinkedIn overlays the profile picture.

## **DESIGN 03 — LinkedIn Banner (Dark Version)**

**Canvas: 1584 × 396 px**

Create an alternative dark version using the same visual composition.

Requirements:

* Dark background derived from the brand palette.
* Bright, controlled accent lighting behind the portrait.
* High-contrast typography.
* Selectively highlighted headline words.
* Subtle background glow and depth.
* Premium, sophisticated, modern appearance.

The light and dark banners must feel like two variations of one unified brand.

## **DESIGN 04 — Professional Portrait Collection**

Create three square professional portraits.

**Canvas: 1080 × 1080 px each**

Portrait A:

* Front-facing professional headshot.
* Neutral, confident expression.
* Solid primary-color background with subtle texture.

Portrait B:

* Friendly, confident portrait.
* Natural smile or relaxed expression.
* Composition inspired by the reference's center portrait.

Portrait C:

* Professional editorial portrait.
* Slightly different framing.
* Consistent lighting and visual identity.

All three portraits must depict the same uploaded person with accurate facial identity.

Do not invent glasses, facial hair, or accessories that are absent from the reference photograph unless explicitly requested.

## **DESIGN 05 — Portfolio Feature Banner**

**Canvas: 1200 × 630 px**

Create a premium portfolio promotional image.

Layout:

* Large headline on the left.
* Highlight the most important word with the primary brand color.
* Professional portrait on the right.
* Dark atmospheric background.
* Subtle gradient glow.
* Prominent call-to-action area.

Suggested text placement:

${primaryCTA || "[PRIMARY_CALL_TO_ACTION]"}

${portfolioUrl || "[PORTFOLIO_URL]"}

Do not invent a URL.

## **DESIGN 06 — Contact / Consultation Feature Banner**

**Canvas: 1200 × 630 px**

Create a matching professional contact or consultation banner.

Layout:

* Large editorial typography on the left.
* Highlight a strategic word or phrase.
* Right: Modern contact card, booking card, or stylized scheduling interface.
* Brand-consistent gradients and atmospheric lighting.

Use:

${secondaryCTA || "[SECONDARY_CALL_TO_ACTION]"}

${contactText || "[CONTACT_TEXT]"}

If booking details are not provided, use a generic contact presentation without fabricated calendar availability.

## **DESIGN 07 — LinkedIn Carousel Cover**

**Canvas: 1080 × 1350 px**

Create a premium LinkedIn carousel cover.

Requirements:

* Large professional portrait.
* Strong typographic hierarchy.
* Brand-color gradient background.
* Subtle geometric and diagonal shapes.
* Small LinkedIn-inspired editorial accent.
* Personal name or social handle.
* Prominent headline based on the user's specialization.

The design must be visually engaging and immediately recognizable in the LinkedIn feed.

## **DESIGN 08 — LinkedIn Profile Showcase**

**Canvas: 1080 × 1350 px**

Create a professional LinkedIn profile showcase design.

Include:

* A stylized LinkedIn-profile-inspired interface.
* User's name and professional title.
* The customized LinkedIn banner.
* Relevant professional keywords.
* Subtle graphical accents.
* Brand-consistent color treatment.

Use a mockup presentation rather than fabricating real LinkedIn metrics, followers, or recommendations.

## **DESIGN 09 — Brand Color Carousel**

**Canvas: 1080 × 1350 px**

Create a typography-focused brand color presentation.

Composition:

* Large heading: "BRAND COLORS"
* Three modern color cards.
* Correct HEX codes.
* Clean, minimal layout.
* Strong visual hierarchy.
* Geometric brand accents.

Use the user's three colors exclusively, plus their tonal variations.

---

# **SECTION 4 — TYPOGRAPHY & ART DIRECTION**

Use a modern, professional sans-serif font system.

Preferred typography characteristics:

* Bold geometric headings.
* Clean, lightweight supporting text.
* Carefully controlled letter spacing.
* Consistent typographic scale.
* Excellent readability at mobile size.
* Selective use of italic emphasis when visually appropriate.

Recommended font families include Inter, Manrope, Satoshi, or similarly styled geometric sans-serif fonts.

Use a consistent spacing system, grid alignment, corner-radius language, and visual treatment across all designs.

Avoid:

* Excessive decoration.
* Random icons.
* Inconsistent font sizes.
* Overcrowded layouts.
* Generic corporate stock imagery.
* Artificial-looking faces.
* Unreadable small text.
* Distorted typography.
* Unnecessary effects.

---

# **SECTION 5 — IMAGE QUALITY & BRAND CONSISTENCY**

All generated assets must follow these standards:

**Visual quality:** Premium, polished, agency-level graphic design.

**Identity consistency:** Same individual across every design.

**Color consistency:** Strictly follow the supplied palette.

**Text accuracy:** Preserve user-provided names, titles, headlines, and spelling.

**Lighting:** Soft, realistic, professional portrait lighting with subtle colored ambient glow.

**Composition:** Balanced negative space, clear focal points, and intentional visual hierarchy.

**Output:** Crisp, high-resolution, publication-ready assets.

Ensure that text and faces are not cropped.

Keep LinkedIn banners readable when displayed on desktop and mobile.

All designs should look like components of one coherent personal branding system.

---

# **SECTION 6 — FINAL OUTPUT REQUIREMENTS**

Generate:

1. One brand color palette.
2. One light LinkedIn banner.
3. One dark LinkedIn banner.
4. Three professional portrait variations.
5. One portfolio feature banner.
6. One contact feature banner.
7. One LinkedIn carousel cover.
8. One LinkedIn profile showcase.
9. One brand color carousel.

**TOTAL: 11 INDIVIDUAL DESIGN ASSETS.**

Additionally, create one professionally arranged **Brand Identity Presentation Board** showing all eleven designs together, organized in the same style as the attached reference image.

Output requirements:

* Export each asset separately at its specified dimensions.
* Export the complete presentation board as a high-resolution image.
* Prefer PNG for final graphics.
* Provide editable source files if the design environment supports them.
* Do not deliver only a single collage when individual assets can be generated.
* Do not stretch or distort designs to fit the required dimensions.
* If the tool cannot export exact dimensions or editable files, state that limitation.

---

# **SECTION 7 — EXECUTION WORKFLOW**

Follow this workflow:

**STEP 1 — ANALYZE**

Analyze the attached reference image and the uploaded personal photograph.

Identify the design system, layout patterns, portrait compositions, typography, gradients, and lighting.

**STEP 2 — PERSONALIZE**

Replace all reference branding with the user's supplied information.

Map the three brand colors to appropriate design roles.

**STEP 3 — BUILD THE SYSTEM**

Establish a unified typography, spacing, color, portrait, and graphic treatment system.

**STEP 4 — GENERATE**

Create the complete collection of eleven individual designs.

Maintain visual consistency across every asset.

**STEP 5 — PRESENT**

Arrange all designs into a polished brand identity presentation board inspired by the original reference.

**STEP 6 — QUALITY CONTROL**

Before final delivery, verify:

* Facial identity consistency.
* Exact spelling of all user text.
* Correct HEX and RGB values.
* Consistent brand colors.
* Appropriate canvas dimensions.
* Safe placement of LinkedIn banner content.
* Clear typography.
* No unintended or fabricated details.
* No missing assets.

Correct any detected issues before delivery.

---

# **FINAL CREATIVE DIRECTION**

The final result should resemble a premium personal branding case study created by an experienced creative agency.

It must preserve the design language of the supplied reference while transforming it into a completely personalized brand identity.

**One person. Three brand colors. One unified visual identity. Eleven coordinated assets.**

Prioritize precision, professionalism, visual consistency, and authentic personal identity.

Begin by analyzing the attached images and supplied user inputs, then execute the complete design system.

### **CRITICAL — LINKEDIN BANNER DIMENSIONS & EDGE-TO-EDGE ENFORCEMENT**

Both LinkedIn banners (Light and Dark) MUST comply with the following non-negotiable requirements:

* **EXACT CANVAS SIZE:** 1584 × 396 pixels.
* **EXACT ASPECT RATIO:** 4:1.
* **ZERO EXTERNAL MARGINS:** No blank, solid-colored, transparent, or decorative padding outside the actual banner design.
* **FULL-BLEED DESIGN:** The background and visual composition must extend continuously from pixel X=0 to X=1583 and from pixel Y=0 to Y=395.
* **NO LETTERBOXING OR PILLARBOXING:** Never place the banner inside a larger canvas, mockup, presentation board, or surrounding background.
* **NO ARTIFICIAL EXTENSIONS:** Do not add extra space to the left or right to accommodate the composition.
* **NO STRETCHING:** Maintain the original proportions of the portrait, typography, and graphical elements.
* **SAFE CONTENT PLACEMENT:** Keep essential text and faces within appropriate LinkedIn-safe areas without creating external margins.

### **Mandatory Pre-Export Validation**

Before delivering either banner:

1. Verify that the exported image is exactly 1584 × 396 pixels.
2. Verify that the actual design touches all four canvas edges.
3. Verify that no external side margins remain.
4. Verify that the image contains no surrounding presentation background.
5. If the dimensions or boundaries are incorrect, automatically crop or recompose the design and validate it again.

**IMPORTANT: A banner that is visually centered inside a wider image is NOT acceptable, even if the outer image measures 1584 × 396 pixels. The banner artwork itself must fill the entire canvas edge-to-edge.**

These requirements override any conflicting layout, spacing, or export instructions elsewhere in this prompt.`;
}

// Smart JSON Extractor (handles markdown fences, escaped underscores, conversational prefix/suffix)
function smartParseBrandJSON(rawText) {
  if (!rawText || !rawText.trim()) {
    return { ok: false, error: "empty" };
  }

  let cleaned = rawText.trim();
  // Remove markdown code fences if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  // Extract first '{' to last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Unescape markdown-escaped underscores or brackets if AI copied escaped keys
  cleaned = cleaned
    .replace(/\\_/g, "_")
    .replace(/\\#/g, "#")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/,\s*([}\]])/g, "$1");

  try {
    const parsed = JSON.parse(cleaned);
    const normalized = structuredClone(DEFAULT_BRAND_DATA);

    for (const key of Object.keys(DEFAULT_BRAND_DATA)) {
      if (key === "KEYWORDS / SKILLS") {
        const val = parsed["KEYWORDS / SKILLS"] ?? parsed["KEYWORDS_SKILLS"] ?? parsed["SKILLS"];
        if (Array.isArray(val)) {
          normalized["KEYWORDS / SKILLS"] = val.map((item) => String(item).trim()).filter(Boolean).slice(0, 3);
        } else if (typeof val === "string" && val.trim()) {
          normalized["KEYWORDS / SKILLS"] = val.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
        }
      } else if (parsed[key] !== undefined && parsed[key] !== null) {
        normalized[key] = String(parsed[key]).trim();
      }
    }

    // Ensure valid HEX colors or fallback
    ["PRIMARY_COLOR", "SECONDARY_COLOR", "TERTIARY_COLOR"].forEach((colorKey) => {
      let c = normalized[colorKey];
      if (c && !c.startsWith("#") && /^[0-9A-Fa-f]{6}$/.test(c)) {
        c = "#" + c;
      }
      if (!/^#[0-9A-Fa-f]{6}$/.test(c)) {
        c = DEFAULT_BRAND_DATA[colorKey];
      }
      normalized[colorKey] = c.toUpperCase();
    });

    return { ok: true, data: normalized };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// Show Toast using Popover API (modern-web-guidance: persistent-toast-notifications)
function showToast(message) {
  const toast = document.getElementById("appToast");
  const msgEl = document.getElementById("toastMessage");
  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  try {
    if (typeof toast.showPopover === "function") {
      toast.showPopover();
    } else {
      toast.classList.add(":popover-open");
      toast.style.display = "inline-flex";
    }
  } catch {
    toast.style.display = "inline-flex";
  }

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    try {
      if (typeof toast.hidePopover === "function") {
        toast.hidePopover();
      } else {
        toast.classList.remove(":popover-open");
        toast.style.display = "none";
      }
    } catch {
      toast.style.display = "none";
    }
  }, 3200);
}

// Step Navigation
function goToStep(stepNumber) {
  document.querySelectorAll(".step-tab").forEach((tab) => {
    const s = Number(tab.dataset.step);
    tab.classList.toggle("active", s === stepNumber);
    tab.classList.toggle("completed", s < stepNumber);
  });

  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.panel) === stepNumber);
  });

  if (stepNumber === 3) {
    refreshMasterPromptPreview();
  }

  const stepperEl = document.querySelector(".stepper-nav");
  if (stepperEl) {
    stepperEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Sync Form UI from currentBrandData
function syncFormFromState(updateTextarea = false) {
  ["PRIMARY_COLOR", "SECONDARY_COLOR", "TERTIARY_COLOR"].forEach((key) => {
    const hexInput = document.getElementById(`hex_${key}`);
    const pickerInput = document.getElementById(`picker_${key}`);
    const val = currentBrandData[key] || DEFAULT_BRAND_DATA[key];
    if (hexInput) hexInput.value = val;
    if (pickerInput && /^#[0-9A-Fa-f]{6}$/.test(val)) pickerInput.value = val;
  });

  // Update dynamic CSS variables
  document.documentElement.style.setProperty("--user-primary", currentBrandData.PRIMARY_COLOR);
  document.documentElement.style.setProperty("--user-secondary", currentBrandData.SECONDARY_COLOR);
  document.documentElement.style.setProperty("--user-tertiary", currentBrandData.TERTIARY_COLOR);

  const textKeys = [
    "FULL_NAME",
    "PROFESSIONAL_TITLE",
    "SPECIALIZATION",
    "MAIN_HEADLINE",
    "SECONDARY_HEADLINE",
    "SHORT_BIO",
    "PRIMARY_CALL_TO_ACTION",
    "SECONDARY_CALL_TO_ACTION",
    "PORTFOLIO_URL",
    "CONTACT_TEXT",
    "SOCIAL_HANDLE",
    "OPTIONAL_ADDITIONAL_TEXT"
  ];

  textKeys.forEach((key) => {
    const el = document.getElementById(`field_${key}`);
    if (el) el.value = currentBrandData[key] || "";
  });

  const skillsEl = document.getElementById("field_SKILLS");
  if (skillsEl) {
    skillsEl.value = (currentBrandData["KEYWORDS / SKILLS"] || []).join(", ");
  }

  if (updateTextarea) {
    const jsonArea = document.getElementById("jsonPasteArea");
    if (jsonArea) {
      jsonArea.value = JSON.stringify(currentBrandData, null, 2);
    }
  }

  refreshMasterPromptPreview();
}

// Sync State when user edits Visual Form fields
function attachVisualFormListeners() {
  ["PRIMARY_COLOR", "SECONDARY_COLOR", "TERTIARY_COLOR"].forEach((key) => {
    const hexInput = document.getElementById(`hex_${key}`);
    const pickerInput = document.getElementById(`picker_${key}`);

    if (pickerInput) {
      pickerInput.addEventListener("input", (e) => {
        const val = e.target.value.toUpperCase();
        currentBrandData[key] = val;
        if (hexInput) hexInput.value = val;
        syncFormFromState(true);
      });
    }

    if (hexInput) {
      hexInput.addEventListener("input", (e) => {
        let val = e.target.value.trim().toUpperCase();
        if (!val.startsWith("#") && /^[0-9A-F]{6}$/.test(val)) {
          val = "#" + val;
        }
        if (/^#[0-9A-F]{6}$/.test(val)) {
          currentBrandData[key] = val;
          if (pickerInput) pickerInput.value = val;
          syncFormFromState(true);
        }
      });
    }
  });

  const textKeys = [
    "FULL_NAME",
    "PROFESSIONAL_TITLE",
    "SPECIALIZATION",
    "MAIN_HEADLINE",
    "SECONDARY_HEADLINE",
    "SHORT_BIO",
    "PRIMARY_CALL_TO_ACTION",
    "SECONDARY_CALL_TO_ACTION",
    "PORTFOLIO_URL",
    "CONTACT_TEXT",
    "SOCIAL_HANDLE",
    "OPTIONAL_ADDITIONAL_TEXT"
  ];

  textKeys.forEach((key) => {
    const el = document.getElementById(`field_${key}`);
    if (el) {
      el.addEventListener("input", (e) => {
        currentBrandData[key] = e.target.value;
        const jsonArea = document.getElementById("jsonPasteArea");
        if (jsonArea) jsonArea.value = JSON.stringify(currentBrandData, null, 2);
        refreshMasterPromptPreview();
      });
    }
  });

  const skillsEl = document.getElementById("field_SKILLS");
  if (skillsEl) {
    skillsEl.addEventListener("input", (e) => {
      currentBrandData["KEYWORDS / SKILLS"] = e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
      const jsonArea = document.getElementById("jsonPasteArea");
      if (jsonArea) jsonArea.value = JSON.stringify(currentBrandData, null, 2);
      refreshMasterPromptPreview();
    });
  }
}

function updateParseStatus(type, message) {
  const banner = document.getElementById("jsonParseStatus");
  if (!banner) return;
  banner.className = `parse-status-banner status-${type}`;
  banner.textContent = message;
}

function refreshMasterPromptPreview() {
  const pre = document.getElementById("finalMasterPromptPre");
  if (!pre) return;
  pre.textContent = buildMasterPrompt(currentBrandData);

  // Also update summary badge in Step 3
  const summaryName = document.getElementById("injectedUserNameBadge");
  if (summaryName) {
    summaryName.textContent =
      currentBrandData.FULL_NAME ||
      (currentLang === "ar" ? "بياناتك المخصصة جاهزة" : "Your Custom Data Injected");
  }
}

// Copy helper
async function copyText(text, successMsgAr, successMsgEn) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(currentLang === "ar" ? successMsgAr : successMsgEn);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast(currentLang === "ar" ? successMsgAr : successMsgEn);
  }
}

// Download Reference Image helper
function downloadReferenceImage() {
  const a = document.createElement("a");
  a.href = "REFERENCE_IMAGE.JPG";
  a.download = "REFERENCE_IMAGE.JPG";
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast(
    currentLang === "ar"
      ? "✅ جاري تحميل الصورة المرجعية REFERENCE_IMAGE.JPG"
      : "✅ Downloading REFERENCE_IMAGE.JPG"
  );
}

// Download Renamed USER_PHOTO helper (100% client-side)
function handleUserPhotoSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  selectedUserPhotoFile = file;

  const previewWrap = document.getElementById("userPhotoPreviewWrap");
  const previewImg = document.getElementById("userPhotoPreviewImg");
  const photoNameMeta = document.getElementById("userPhotoMetaText");
  const downloadBtn = document.getElementById("downloadUserPhotoBtn");

  const url = URL.createObjectURL(file);
  if (previewImg) previewImg.src = url;
  if (previewWrap) previewWrap.classList.add("visible");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const targetName = `USER_PHOTO.${ext === "png" ? "png" : "jpg"}`;

  if (photoNameMeta) {
    photoNameMeta.textContent =
      currentLang === "ar"
        ? `تم تجهيز الصورة بنجاح ← سيُحفظ الملف باسم: ${targetName}`
        : `Photo ready → Will be saved as: ${targetName}`;
  }
  if (downloadBtn) {
    downloadBtn.style.display = "inline-flex";
    downloadBtn.onclick = () => {
      const a = document.createElement("a");
      a.href = url;
      a.download = targetName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(
        currentLang === "ar"
          ? `✅ تم تحميل صورتك باسم ${targetName} جاهزة للإرفاق!`
          : `✅ Downloaded your photo as ${targetName}!`
      );
    };
  }
}

// Language Toggle (AR / EN)
function toggleLanguage() {
  currentLang = currentLang === "ar" ? "en" : "ar";
  const html = document.documentElement;
  html.lang = currentLang;
  html.dir = currentLang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-ar][data-en]").forEach((el) => {
    el.textContent = currentLang === "ar" ? el.dataset.ar : el.dataset.en;
  });

  document.querySelectorAll("[data-placeholder-ar][data-placeholder-en]").forEach((el) => {
    el.placeholder =
      currentLang === "ar" ? el.dataset.placeholderAr : el.dataset.placeholderEn;
  });

  refreshMasterPromptPreview();
}

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  // Populate Step 1 Prompt
  const step1Pre = document.getElementById("step1PromptPre");
  if (step1Pre) step1Pre.textContent = STEP_1_PROMPT;

  // Stepper Tab Clicks
  document.querySelectorAll(".step-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      goToStep(Number(tab.dataset.step));
    });
  });

  // Step 1 Copy Button
  document.getElementById("copyStep1Btn")?.addEventListener("click", () => {
    copyText(
      STEP_1_PROMPT,
      "✅ تم نسخ برومبت الخطوة الأولى! الصقه الآن في ChatGPT أو Claude أو Gemini.",
      "✅ Step 1 Prompt copied! Paste it into ChatGPT, Claude, or Gemini."
    );
  });

  document.getElementById("copyStep1AndNextBtn")?.addEventListener("click", () => {
    copyText(
      STEP_1_PROMPT,
      "✅ تم نسخ البرومبت! بعد الحصول على كود JSON من وكيلك، الصقه هنا في الخطوة ٢.",
      "✅ Prompt copied! Once your AI gives you the JSON output, paste it here in Step 2."
    );
    goToStep(2);
  });

  // Step 2 Paste & Parse Listeners
  const jsonArea = document.getElementById("jsonPasteArea");
  if (jsonArea) {
    jsonArea.addEventListener("input", (e) => {
      const res = smartParseBrandJSON(e.target.value);
      if (res.ok) {
        currentBrandData = res.data;
        syncFormFromState(false);
        updateParseStatus(
          "ok",
          currentLang === "ar"
            ? "✓ تم قراءة واستخراج بيانات الهوية بنجاح! يمكنك مراجعتها أو تعديلها باليسار."
            : "✓ Brand JSON parsed successfully! You can review or tweak any field."
        );
      } else if (res.error === "empty") {
        updateParseStatus(
          "idle",
          currentLang === "ar"
            ? "بانتظار لصق مخرجات الـ JSON من وكيل الذكاء الاصطناعي..."
            : "Waiting for you to paste the JSON output from your AI assistant..."
        );
      } else {
        updateParseStatus(
          "error",
          currentLang === "ar"
            ? "⚠️ النص الملصق لا يبدو كملف JSON مكتمل بعد — تأكد من نسخ المخرجات كاملة أو اضغط (بيانات تجريبية)."
            : "⚠️ Could not parse valid JSON yet — make sure you copied the full block or click Load Demo."
        );
      }
    });
  }

  // Paste from Clipboard Button
  document.getElementById("pasteClipboardBtn")?.addEventListener("click", async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText && jsonArea) {
        jsonArea.value = clipText;
        jsonArea.dispatchEvent(new Event("input"));
        showToast(
          currentLang === "ar"
            ? "✅ تم اللصق من الحافظة واستخراج البيانات!"
            : "✅ Pasted from clipboard and parsed!"
        );
      }
    } catch {
      jsonArea?.focus();
      showToast(
        currentLang === "ar"
          ? "اضغط Ctrl+V أو Cmd+V داخل المربع للصق المحتوى"
          : "Press Ctrl+V or Cmd+V inside the box to paste"
      );
    }
  });

  // Load Demo Data Button (Ali Nasser showcase)
  document.getElementById("loadDemoBtn")?.addEventListener("click", () => {
    currentBrandData = structuredClone(DEMO_BRAND_DATA);
    syncFormFromState(true);
    updateParseStatus(
      "ok",
      currentLang === "ar"
        ? "✓ تم تحميل بيانات تجريبية (هوية Ali Nasser) — يمكنك التعديل عليها أو الانتقال للخطوة ٣!"
        : "✓ Loaded demo brand data (Ali Nasser) — tweak any field or proceed to Step 3!"
    );
    showToast(
      currentLang === "ar"
        ? "✨ تم تعبئة مثال تفاعلي جاهز للتجربة!"
        : "✨ Interactive demo data loaded!"
    );
  });

  // Step 2 -> Step 3 Button
  document.getElementById("goToStep3Btn")?.addEventListener("click", () => {
    refreshMasterPromptPreview();
    goToStep(3);
    showToast(
      currentLang === "ar"
        ? "🎉 تم حقن بياناتك وتوليد البرومبت النهائي بنجاح!"
        : "🎉 Your data has been injected into the Final Master Prompt!"
    );
  });

  document.getElementById("backToStep1Btn")?.addEventListener("click", () => goToStep(1));
  document.getElementById("backToStep2Btn")?.addEventListener("click", () => goToStep(2));

  // Step 3 Actions
  document.getElementById("copyFinalPromptBtn")?.addEventListener("click", () => {
    copyText(
      buildMasterPrompt(currentBrandData),
      "🚀 تم نسخ البرومبت النهائي المحقون ببياناتك! أرفق معه REFERENCE_IMAGE.JPG وصورتك USER_PHOTO.",
      "🚀 Final Master Prompt copied! Attach REFERENCE_IMAGE.JPG and your USER_PHOTO."
    );
  });

  document.getElementById("downloadFinalPromptBtn")?.addEventListener("click", () => {
    const content = buildMasterPrompt(currentBrandData);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CUSTOM_BRAND_KIT_MASTER_PROMPT.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(
      currentLang === "ar"
        ? "✅ تم تحميل البرومبت النهائي كملف Markdown"
        : "✅ Downloaded Final Master Prompt (.md)"
    );
  });

  document.querySelectorAll(".download-ref-trigger").forEach((btn) => {
    btn.addEventListener("click", downloadReferenceImage);
  });

  // User Photo local helper
  const userPhotoInput = document.getElementById("userPhotoFileInput");
  if (userPhotoInput) {
    userPhotoInput.addEventListener("change", handleUserPhotoSelect);
  }
  document.getElementById("selectUserPhotoBtn")?.addEventListener("click", () => {
    userPhotoInput?.click();
  });

  // Reference Image Lightbox Modal
  const refModal = document.getElementById("refImageModal");
  document.getElementById("openRefPreviewBtn")?.addEventListener("click", () => {
    refModal?.showModal();
  });
  document.getElementById("closeRefModalBtn")?.addEventListener("click", () => {
    refModal?.close();
  });
  refModal?.addEventListener("click", (e) => {
    if (e.target === refModal) refModal.close();
  });

  // Language switcher
  document.getElementById("langToggleBtn")?.addEventListener("click", toggleLanguage);

  // Initialize form & preview
  attachVisualFormListeners();
  syncFormFromState(false);
});
