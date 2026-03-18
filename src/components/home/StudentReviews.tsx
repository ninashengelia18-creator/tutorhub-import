import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const reviews = [
  {
    name: "James, 16",
    initials: "J",
    quote:
      "I went from failing maths to getting an A in my GCSEs. My tutor explained everything so clearly.",
    rating: 5,
  },
  {
    name: "Fatima, 24",
    initials: "F",
    quote:
      "Found an amazing English tutor in 10 minutes. The booking process was so simple.",
    rating: 5,
  },
  {
    name: "Sophie, 31",
    initials: "S",
    quote:
      "My conversation partner helped me feel confident speaking Spanish before my trip to Madrid.",
    rating: 5,
  },
  {
    name: "David, 38",
    initials: "D",
    quote:
      "As a professional I needed Business English fast. LearnEazy matched me with the perfect tutor.",
    rating: 5,
  },
];

export function StudentReviews() {
  return (
    <section className="py-16 md:py-20">
      <div className="container">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          What Our Students Say
        </h2>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem
                key={review.name}
                className="pl-4 basis-full md:basis-1/2"
              >
                <div className="bg-card border border-border rounded-2xl p-8 flex flex-col gap-5 h-full">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-foreground/90 italic leading-relaxed text-base flex-1">
                    "{review.quote}"
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground text-sm">
                      — {review.name}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="hidden sm:flex -left-12 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground" />
          <CarouselNext className="hidden sm:flex -right-12 bg-card border-border text-foreground hover:bg-primary hover:text-primary-foreground" />
        </Carousel>
      </div>
    </section>
  );
}
