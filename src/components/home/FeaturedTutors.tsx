import { Link } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getTutorFullName, getTutorAvatar, getTutorSubjects } from "@/lib/publicTutors";
import type { PublicTutorProfile } from "@/lib/publicTutors";

export function FeaturedTutors() {
  const { data: tutors = [] } = useQuery({
    queryKey: ["featured-tutors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("public_tutor_profiles")
        .select("*")
        .eq("is_published", true)
        .order("rating", { ascending: false })
        .limit(12);
      return (data ?? []) as PublicTutorProfile[];
    },
  });

  if (tutors.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Meet Our Tutors
        </h2>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {tutors.map((tutor) => {
              const name = getTutorFullName(tutor);
              const avatar = getTutorAvatar(tutor);
              const subjects = getTutorSubjects(tutor);

              return (
                <CarouselItem
                  key={tutor.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                      <p className="text-sm text-muted-foreground">{subjects[0]}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(tutor.rating)
                              ? "fill-warning text-warning"
                              : "text-muted-foreground/40"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({tutor.review_count})
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-auto rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      asChild
                    >
                      <Link to={`/tutor/${tutor.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious className="hidden sm:flex -left-12 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground" />
          <CarouselNext className="hidden sm:flex -right-12 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground" />
        </Carousel>
      </div>
    </section>
  );
}
