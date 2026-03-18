import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FeaturedTutors() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
          Meet Our Tutors
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Our tutors are being verified — be the first to join!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="relative bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 select-none"
            >
              {/* Blur overlay */}
              <div className="absolute inset-0 rounded-2xl bg-muted/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                  Launching Soon
                </Badge>
              </div>

              {/* Greyed placeholder content */}
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <User className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-2 w-full">
                <div className="h-4 w-24 mx-auto rounded bg-muted" />
                <div className="h-3 w-16 mx-auto rounded bg-muted" />
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="h-4 w-4 rounded-full bg-muted" />
                ))}
              </div>
              <div className="h-8 w-24 rounded-full bg-muted" />
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button size="lg" asChild>
            <Link to="/tutor-apply">Become Our First Tutor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
