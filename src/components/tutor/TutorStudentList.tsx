import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface StudentRecord {
  student_id: string;
  student_name: string | null;
  subject: string;
  lesson_count: number;
  last_lesson: string;
}

export function TutorStudentList({ tutorName }: { tutorName: string }) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tutorName) return;

    const load = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("student_id, student_name, subject, lesson_date")
        .eq("tutor_name", tutorName)
        .in("status", ["confirmed", "completed"])
        .order("lesson_date", { ascending: false });

      if (!data) {
        setLoading(false);
        return;
      }

      // Group by student_id
      const map = new Map<string, StudentRecord>();
      for (const row of data) {
        const existing = map.get(row.student_id);
        if (existing) {
          existing.lesson_count += 1;
        } else {
          map.set(row.student_id, {
            student_id: row.student_id,
            student_name: row.student_name,
            subject: row.subject,
            lesson_count: 1,
            last_lesson: row.lesson_date,
          });
        }
      }

      setStudents(Array.from(map.values()));
      setLoading(false);
    };

    void load();
  }, [tutorName]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading students...</div>;
  }

  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center">
        <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">No students yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Once students book lessons with you, they'll appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Your Students</h3>
        <Badge variant="outline">{students.length}</Badge>
      </div>
      <div className="space-y-2">
        {students.map((student) => (
          <div key={student.student_id} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div>
              <p className="font-medium">{student.student_name || "Unnamed Student"}</p>
              <p className="text-sm text-muted-foreground">{student.subject}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{student.lesson_count} lesson{student.lesson_count !== 1 ? "s" : ""}</p>
              <p className="text-xs text-muted-foreground">Last: {student.last_lesson}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
