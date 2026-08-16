/* eslint-disable @next/next/no-img-element -- The testimonial portrait is pre-compressed and served responsively without the Next image runtime. */

import { clientTestimonials } from "./testimonials-data";

export function ClientTestimonials() {
  return (
    <section className="section client-testimonials" aria-labelledby="client-testimonials-title" data-reveal>
      <header className="testimonials-intro">
        <p className="kicker">Client testimonials</p>
        <h2 id="client-testimonials-title">What clients say.</h2>
      </header>

      <div className="testimonials-list">
        {clientTestimonials.map((testimonial) => (
          <article
            className={`testimonial-entry${testimonial.image ? " has-image" : " is-text-only"}`}
            key={testimonial.id}
            aria-label={`${testimonial.name} testimonial`}
          >
            {testimonial.image ? (
              <figure className="testimonial-portrait">
                <img
                  src={testimonial.image.src}
                  alt={testimonial.image.alt}
                  width={testimonial.image.width}
                  height={testimonial.image.height}
                  sizes="(max-width: 50rem) calc(100vw - 2.5rem), (max-width: 74rem) 38vw, 30rem"
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ) : null}

            <div className="testimonial-copy">
              <blockquote>
                <p className="testimonial-pull">“{testimonial.pullQuote}”</p>
                <p className="testimonial-body">{testimonial.fullQuote}</p>
              </blockquote>

              <footer className="testimonial-footer">
                <div className="testimonial-attribution">
                  <cite>{testimonial.name}</cite>
                  <span>{testimonial.role}</span>
                </div>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
