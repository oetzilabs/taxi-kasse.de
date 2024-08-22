import { For } from "solid-js";

function TestimonialSection() {
  const testimonials = [
    {
      quote: "Taxi-Kasse.de saved me hours of paperwork every month. The automated reports are a game-changer!",
      author: "Anonymous",
    },
    {
      quote: "The ride analysis helped me understand peak hours and optimize my routes.",
      author: "Anonymous",
    },
  ];

  return (
    <section class="py-32 bg-black dark:bg-white">
      <div class="w-full space-y-12 container mx-auto flex flex-col text-white dark:text-black">
        <div class="space-y-6">
          <h3 class="text-5xl font-bold ">What our Users say:</h3>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <For each={testimonials}>
            {(testimonial) => (
              <blockquote class="flex flex-col items-start gap-4 py-6 grow">
                “{testimonial.quote}”
                <div class="grow" />
                <span class="block mt-4 font-semibold text-muted-foreground">– {testimonial.author}</span>
              </blockquote>
            )}
          </For>
        </div>
      </div>
    </section>
  );
}

export default TestimonialSection;
