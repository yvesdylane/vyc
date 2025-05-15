export async function sendVerificationEmail(to: string, name: string, token: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY");

  const emailBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Hello ${name},</h2>
      <p>Thank you for registering. Please use the verification token below to activate your account:</p>
      <h3 style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${token}</h3>
      <p>This token will expire in 24 hours.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev", // this must be a verified sender
      to: [to],
      subject: "Verify Your Email",
      html: emailBody,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${JSON.stringify(error)}`);
  }
}
