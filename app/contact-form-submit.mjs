export const contactFormEndpoint = "https://formspree.io/f/xkjwbaoe";

export async function submitContactForm(formData, fetcher = fetch) {
  const response = await fetcher(contactFormEndpoint, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error("Contact form submission failed");
  return response;
}
