export function OfficeMap() {
  return (
    <section className="py-20 bg-white border-t border-border" aria-labelledby="office-heading">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 id="office-heading" className="font-serif text-3xl lg:text-4xl font-medium text-ink text-center mb-10">
          Visit our office
        </h2>
        <div className="w-full aspect-[16/9] max-h-[500px] rounded-xl overflow-hidden border border-border">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3422.5!2d75.8573!3d30.9010!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a8370c9e5c7b5%3A0x3f5c5a6e5b5a5b5a!2sMundian%20Kalan%2C%20Ludhiana%2C%20Punjab!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Shivaay Logistics Office Location"
          />
        </div>
      </div>
    </section>
  );
}
