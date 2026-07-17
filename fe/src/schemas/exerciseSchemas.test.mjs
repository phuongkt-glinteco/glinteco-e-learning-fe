import assert from "node:assert/strict";
import { createExerciseFormSchema } from "./exerciseSchemas.ts";

const baseExercise = {
  title: "Exercise",
  tag: "quiz",
  difficulty: "Beginner",
  estimatedTime: "30m",
  xp: "100",
  brief: "Brief",
  overview: "Overview",
  objectives: ["Objective"],
  steps: ["Step"],
  resourceDocIds: [],
  hint: "",
};

{
  const result = createExerciseFormSchema.safeParse({
    ...baseExercise,
    type: "QUIZ",
    questionsData: [
      {
        id: "q-1",
        prompt: "Question 1",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "A is correct.",
      },
    ],
    targetScore: "80",
  });

  assert.equal(result.success, true);
}

{
  const result = createExerciseFormSchema.safeParse({
    ...baseExercise,
    type: "FILL_IN_BLANK",
    questionsData: [
      { id: "same", prompt: "One", correctAnswer: "one", explanation: "First" },
      { id: "same", prompt: "Two", correctAnswer: "two", explanation: "Second" },
    ],
    targetScore: "80",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.message === "questionIdsUnique"));
  }
}

{
  const result = createExerciseFormSchema.safeParse({
    ...baseExercise,
    type: "QUIZ",
    questionsData: [
      {
        id: "q-1",
        prompt: "Question 1",
        options: ["Only one option"],
        correctAnswer: "Missing",
        explanation: "Explanation",
      },
    ],
    targetScore: "101",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);
    assert.ok(messages.includes("quizOptionsExact"));
    assert.ok(messages.includes("quizCorrectAnswerInvalid"));
    assert.ok(messages.includes("targetScoreInvalid"));
  }
}

{
  const result = createExerciseFormSchema.safeParse({
    ...baseExercise,
    type: "FILL_IN_BLANK",
    questionsData: [],
    targetScore: "70",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.message === "questionsMin"));
  }
}

{
  const result = createExerciseFormSchema.safeParse({
    ...baseExercise,
    type: "FILL_IN_BLANK",
    questionsData: [
      { id: "q-1", prompt: "Fill this", correctAnswer: "answer", explanation: "Explanation" },
    ],
    targetScore: "12.5",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.message === "targetScoreInvalid"));
  }
}

console.log("exercise schema test passed");
