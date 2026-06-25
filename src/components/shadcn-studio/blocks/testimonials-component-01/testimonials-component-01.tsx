"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Rating } from "@/components/ui/rating";

export type TestimonialItem = {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
};

type TestimonialsComponentProps = {
  testimonials: TestimonialItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
};

const TestimonialsComponent = ({
  testimonials,
  eyebrow = "Real customers",
  title = "Customers Feedback",
  description = "From quick event needs to corporate branding, here is what customers say about our lanyard service.",
}: TestimonialsComponentProps) => {
  return (
    <section id="testimonials" className="bg-[#fafafa] py-12 sm:py-16 lg:py-24 scroll-mt-16">
      <Carousel
        className="mx-auto flex max-w-7xl gap-10 px-4 max-sm:flex-col sm:items-center sm:gap-12 sm:px-6 lg:gap-20 lg:px-8"
        opts={{
          align: "start",
          slidesToScroll: 1,
        }}
      >
        <div className="space-y-4 text-center sm:w-1/2 sm:text-left lg:w-1/3">
          <div className="inline-flex items-center justify-center gap-3 text-brand-red sm:justify-start">
            <span className="h-px w-8 bg-current" />
            <p className="text-xs font-extrabold uppercase tracking-[0.18em]">{eyebrow}</p>
            <span className="h-px w-8 bg-current" />
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-[#373f50] sm:text-4xl lg:text-5xl">
            {title}
          </h2>

          <p className="text-sm leading-relaxed text-gray-500 sm:text-base font-normal">{description}</p>

          <div className="flex items-center justify-center gap-4 pt-2 sm:justify-start">
            <CarouselPrevious className="disabled:bg-brand-light-100 disabled:text-brand-red disabled:opacity-100" />
            <CarouselNext className="disabled:bg-brand-light-100 disabled:text-brand-red disabled:opacity-100" />
          </div>
        </div>

        <div className="relative min-w-0 sm:w-1/2 lg:w-2/3">
          <CarouselContent className="ml-0">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={`${testimonial.name}-${index}`} className="p-2 sm:p-3 lg:basis-1/2">
                <Card className="h-full min-h-[260px] transition-colors duration-300 hover:ring-2 hover:ring-brand-red/20">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ", 2)
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-bold text-[#373f50]">{testimonial.name}</h3>
                      <p className="text-sm leading-snug text-gray-500">
                        {testimonial.role} at <span className="font-semibold text-[#373f50]">{testimonial.company}</span>
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Rating readOnly variant="yellow" size={22} value={testimonial.rating} precision={0.5} />
                  </CardContent>
                  <CardContent>
                    <p className="text-base leading-relaxed text-gray-600 font-normal">{testimonial.content}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </section>
  );
};

export default TestimonialsComponent;
