
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  doctorEmail: string;
  doctorName: string;
  patientName: string;
  appointmentDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { doctorEmail, doctorName, patientName, appointmentDate }: NotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Medical Dashboard <onboarding@resend.dev>",
      to: [doctorEmail],
      subject: "New Appointment Assignment",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Appointment Assignment</h2>
          <p>Dear Dr. ${doctorName},</p>
          <p>You have been assigned a new appointment:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Date & Time:</strong> ${appointmentDate}</p>
            <p><strong>Status:</strong> Confirmed</p>
          </div>
          <p>Please review the appointment details in your dashboard and prepare accordingly.</p>
          <p>Best regards,<br>Medical Dashboard Team</p>
        </div>
      `,
    });

    console.log("Doctor notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-doctor-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
