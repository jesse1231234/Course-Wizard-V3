import type { Section, Question } from "@/types";

export const sections: Section[] = [
  {
    id: "course-info",
    title: "Course Information",
    description: "Let's start with the basics about your course.",
    questions: [
      {
        id: "course-title",
        type: "text",
        label: "What is the title of your course?",
        placeholder: "e.g., Introduction to Data Science",
        required: true,
        validation: { minLength: 3, maxLength: 150 },
      },
      {
        id: "course-code",
        type: "text",
        label: "What is your course code?",
        placeholder: "e.g., CS 101, MATH 2001",
        required: true,
      },
      {
        id: "course-description",
        type: "textarea",
        label: "Provide a general description of the course.",
        description: "What does it cover, and why is it valuable to students?",
        placeholder: "Describe the course content, its relevance, and what makes it valuable...",
        required: true,
        validation: { minLength: 50, maxLength: 2000 },
      },
      {
        id: "student-level",
        type: "select",
        label: "What level of students generally take this course?",
        required: true,
        options: [
          { value: "freshman", label: "Freshman" },
          { value: "sophomore", label: "Sophomore" },
          { value: "junior", label: "Junior" },
          { value: "senior", label: "Senior" },
          { value: "graduate", label: "Graduate" },
        ],
      },
      {
        id: "delivery-format",
        type: "select",
        label: "Delivery Format",
        description: "How will this course be delivered?",
        required: true,
        options: [
          { value: "fully-online", label: "Fully Online (Asynchronous)" },
          { value: "online-synchronous", label: "Online with Synchronous Sessions" },
          { value: "hybrid", label: "Hybrid" },
          { value: "in-person", label: "Primarily In-Person with Online Components" },
        ],
      },
      {
        id: "course-duration",
        type: "select",
        label: "Course Duration",
        description: "How long does the course run?",
        required: true,
        options: [
          { value: "8-weeks", label: "8 Weeks" },
          { value: "10-weeks", label: "10 Weeks" },
          { value: "15-weeks", label: "15-16 Weeks" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "credit-hours",
        type: "select",
        label: "Credit Hours",
        description: "How many credit hours is this course worth?",
        required: true,
        options: [
          { value: "1", label: "1 Credit" },
          { value: "2", label: "2 Credits" },
          { value: "3", label: "3 Credits" },
          { value: "4", label: "4 Credits" },
          { value: "5", label: "5+ Credits" },
        ],
      },
      {
        id: "num-modules",
        type: "select",
        label: "How many Modules (Units) will this course contain?",
        required: true,
        options: [
          { value: "4", label: "4 Modules" },
          { value: "6", label: "6 Modules" },
          { value: "8", label: "8 Modules" },
          { value: "10", label: "10 Modules" },
          { value: "12", label: "12 Modules" },
          { value: "15", label: "15+ Modules" },
        ],
      },
    ],
  },
  {
    id: "learning-outcomes",
    title: "Learning Outcomes",
    description: "Now let's think about what students will learn, how they'll learn it, and how you'll know they've learned it.",
    questions: [
      {
        id: "learning-objectives",
        type: "skill-list",
        label: "List 3-6 things that students will be able to do after completing the course that they couldn't do before (or will improve at).",
        description: "Focus on concrete, observable abilities. Each skill gets its own text box.",
        required: true,
        validation: { minLength: 10, maxLength: 500 },
        feedbackEnabled: true,
        feedbackInstructions: `Check that this skill or ability is measurable (i.e., you could observe or assess whether a student has achieved it).

If suggestions are warranted, guide the user toward:
- Focusing on a concrete skill rather than abstract knowledge ("analyze data" rather than "understand data")
- Making the outcome measurable and observable ("design an experiment" rather than "appreciate the scientific method")
- Using specific action verbs that indicate what students will DO

Provide a brief rationale for any suggestions.`,
      },
      {
        id: "skill-activities",
        type: "skill-detail",
        label: "For each skill, describe 3-6 types of activities that would help students develop or improve that skill.",
        description: "You can describe general activity types if you don't have specifics in mind yet. Try to explain how each type of activity will help improve the skill.",
        parentQuestionId: "learning-objectives",
        required: true,
        validation: { minLength: 20, maxLength: 2000 },
        feedbackEnabled: true,
        feedbackInstructions: `Check for alignment between the skill stated above and the activities described here.

Focus suggestions on:
- Alignment: Do the activities clearly support this specific skill?
- Experiential learning: Encourage hands-on, project-based, and experiential activities rather than relying solely on reading/writing/lecture-based approaches
- Diversity of activities: Are there varied activity types (individual, collaborative, hands-on, reflective)? If activities feel repetitive or one-dimensional, suggest additional types
- How each activity builds the target skill

Provide a brief rationale for any suggestions.`,
      },
      {
        id: "skill-assessments",
        type: "skill-detail",
        label: "For each skill, how will you know when students have improved at or mastered this skill?",
        description: "Describe the evidence, performance, or criteria you'd look for to know a student has achieved each skill.",
        parentQuestionId: "learning-objectives",
        required: true,
        validation: { minLength: 15, maxLength: 1000 },
        feedbackEnabled: true,
        feedbackInstructions: `Check for alignment between this assessment/mastery indicator and the skill and activities already provided.

Focus suggestions on:
- Does the indicator align with the stated skill? Can it actually measure improvement in the target skill?
- Does the assessment approach connect back to the activities described for this skill?
- Is the indicator specific enough to distinguish mastery from partial understanding?

If misalignment is found, provide suggestions for improvement with a brief rationale.`,
      },
    ],
  },
  {
    id: "course-design",
    title: "Course Design",
    description: "Let's map out the structure of your course and how you'll assess student work.",
    questions: [
      {
        id: "module-details",
        type: "textarea",
        label: "For each module, provide a title and a few sentences that describe how what students do in that module leads to the skills of the subsequent module.",
        description: "Describe the progression across modules — how each one builds toward the next. Organize your response by module number.",
        placeholder: "Module 1: Foundations of Data Science\nStudents learn core concepts and tools that form the basis for all subsequent hands-on work. By the end, they can navigate Python and basic data structures.\n\nModule 2: Data Collection & Cleaning\nBuilding on Module 1's tools, students learn to gather and prepare real-world data, setting the stage for analysis in Module 3.\n...",
        required: true,
        validation: { minLength: 50, maxLength: 6000 },
        feedbackEnabled: true,
        feedbackInstructions: `Check the module descriptions for:
- Alignment with the course objectives (skills) already stated — do these modules collectively build toward those skills?
- Module-to-module progression: Does each module clearly build on the previous one and set up the next?
- Clarity: Are the descriptions clear about what students will do and learn in each module?

Make suggestions based on alignment, progression, and clarity. Provide a brief rationale.`,
      },
      {
        id: "assignment-details",
        type: "textarea",
        label: 'List any "Major Assignments" that you have in mind for the course.',
        description: "These are the significant graded assignments (projects, papers, exams, presentations, etc.) that carry meaningful weight in the course.",
        placeholder: "1. Midterm Data Analysis Project — Students analyze a real dataset and present findings\n2. Experiment Design Proposal — Students design a complete experiment with controls and methodology\n3. Final Portfolio — Students compile and reflect on their best work from the semester",
        required: true,
        validation: { minLength: 20, maxLength: 3000 },
        feedbackEnabled: true,
        feedbackInstructions: `Check for alignment between these major assignments and the course objectives (skills) already stated.

Focus suggestions on:
- Do these assignments give students meaningful opportunities to demonstrate the target skills?
- Encourage experiential or project-based approaches where appropriate, rather than exclusively written/test-based assessments
- Are there enough major assignments to assess the breadth of skills in the course?

Provide a brief rationale for any suggestions.`,
      },
      {
        id: "assignment-types",
        type: "multiselect",
        label: "Check any assignment types you think belong in the course.",
        required: true,
        options: [
          { value: "projects", label: "Projects" },
          { value: "labs", label: "Labs" },
          { value: "case-studies", label: "Case Studies" },
          { value: "reflections", label: "Reflection Journals" },
          { value: "peer-review", label: "Peer Review Activities" },
          { value: "presentations", label: "Presentations" },
        ],
      },
      {
        id: "rubric-criteria",
        type: "textarea",
        label: "When grading student work, what qualities are the most important to you?",
        description: "Think about what makes student work excellent versus just acceptable. What do you look for?",
        placeholder: "e.g., Accuracy of analysis, clarity of communication, creativity in approach, thoroughness of documentation, ability to connect findings to broader concepts...",
        required: true,
        validation: { minLength: 20, maxLength: 2000 },
        feedbackEnabled: true,
        feedbackInstructions: `Check these grading qualities for alignment with the course objectives (skills) and measurability.

Focus suggestions on:
- Are these qualities aligned with the skills students are meant to develop?
- Can these qualities be measured or observed in student work? If a quality is too vague (e.g., "effort"), suggest ways to make it more concrete and assessable
- Remind the user that the most useful grading criteria connect directly to course objectives

Provide a brief rationale for any suggestions.`,
      },
    ],
  },
  {
    id: "visual-design",
    title: "Visual Design",
    description: "Finally, choose the visual elements for your course pages.",
    questions: [
      {
        id: "design-components",
        type: "multiselect",
        label: "Select the design components you would like included in your course.",
        required: true,
        options: [
          { value: "callouts", label: "Callouts (highlighted information boxes)" },
          { value: "quick-checks", label: "Quick Checks (inline knowledge checks)" },
        ],
      },
      {
        id: "design-theme",
        type: "select",
        label: "What DesignTools theme would you like to use?",
        description: "This determines the visual style of your course pages.",
        required: true,
        options: [
          { value: "dp-flat-sections-2", label: "Flat Sections" },
          { value: "dp-rounded-headings", label: "Rounded Headings" },
          { value: "dp-circle-left", label: "Circle Left" },
        ],
      },
    ],
  },
];

export function getSectionById(id: string): Section | undefined {
  return sections.find((s) => s.id === id);
}

export function getQuestionById(id: string): Question | undefined {
  for (const section of sections) {
    const question = section.questions.find((q) => q.id === id);
    if (question) return question;
  }
  return undefined;
}

export function getAllQuestions(): Question[] {
  return sections.flatMap((s) => s.questions);
}

export function getQuestionIndex(questionId: string): number {
  return getAllQuestions().findIndex((q) => q.id === questionId);
}

export function getSectionForQuestion(questionId: string): Section | undefined {
  return sections.find((s) => s.questions.some((q) => q.id === questionId));
}
