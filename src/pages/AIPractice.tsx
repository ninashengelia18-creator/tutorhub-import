import { useState } from "react";
import { Brain, BookOpen, Target, CheckCircle, ArrowRight, Sparkles, Briefcase, Plane, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const dailyExercises = [
  { id: 1, subject: "Mathematics", title: "Solve: 2x² + 5x - 3 = 0", difficulty: "Medium", completed: true },
  { id: 2, subject: "Physics", title: "Calculate the velocity of a 5kg object with 25N force", difficulty: "Easy", completed: false },
  { id: 3, subject: "English", title: "Fill in the blanks: Conditional sentences", difficulty: "Medium", completed: false },
  { id: 4, subject: "Programming", title: "Write a function to reverse a linked list", difficulty: "Hard", completed: false },
];

const scenarios = [
  { id: 1, title: "Job Interview Prep", description: "Practice answering common interview questions in English with AI feedback", subject: "English", duration: "15 min", icon: Briefcase },
  { id: 2, title: "Travel Conversations", description: "Practice ordering food, asking directions, and booking hotels in a foreign language", subject: "Languages", duration: "10 min", icon: Plane },
  { id: 3, title: "Business Presentation", description: "Rehearse pitching ideas, negotiating deals, and leading meetings in English", subject: "Business English", duration: "20 min", icon: Building2 },
  { id: 4, title: "Math Problem Solving", description: "Work through word problems step by step with AI guidance", subject: "Mathematics", duration: "20 min", icon: Brain },
  { id: 5, title: "Code Review", description: "Get feedback on your code and learn best practices", subject: "Programming", duration: "25 min", icon: Sparkles },
];

export default function AIPractice() {
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl hero-gradient flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">AI Practice</h1>
          </div>
          <p className="text-muted-foreground mb-8 ml-[52px]">Daily exercises and scenario practice powered by AI</p>
        </motion.div>

        {/* Daily exercises */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border bg-card p-5 card-shadow mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Exercises
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full tabular-nums">
              1/4 completed
            </span>
          </div>
          <div className="space-y-2">
            {dailyExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                  exercise.completed
                    ? "bg-primary-light/50 border-primary/20"
                    : selectedExercise === exercise.id
                    ? "border-primary bg-primary-light"
                    : "hover:border-muted-foreground/30"
                }`}
              >
                {exercise.completed ? (
                  <CheckCircle className="h-5 w-5 text-success shrink-0" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${exercise.completed ? "line-through text-muted-foreground" : ""}`}>
                    {exercise.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{exercise.subject}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  exercise.difficulty === "Easy" ? "bg-success/10 text-success" :
                  exercise.difficulty === "Medium" ? "bg-warning/10 text-warning" :
                  "bg-destructive/10 text-destructive"
                }`}>
                  {exercise.difficulty}
                </span>
              </button>
            ))}
          </div>
          {selectedExercise && (
            <Button className="w-full mt-4 hero-gradient text-primary-foreground border-0">
              <Sparkles className="mr-2 h-4 w-4" />
              Start Exercise with AI
            </Button>
          )}
        </motion.div>

        {/* Scenario Practice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Scenario Practice
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-xl border bg-card p-4 card-shadow hover:card-shadow-hover hover:border-primary/30 transition-all cursor-pointer group"
              >
                <div className="h-9 w-9 rounded-lg bg-primary-light flex items-center justify-center mb-3">
                  <scenario.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <p className="text-xs text-primary font-medium mb-1">{scenario.subject}</p>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{scenario.title}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{scenario.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground tabular-nums">{scenario.duration}</span>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
