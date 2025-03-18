// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

console.log("Processing request from Dialogflow API");

Deno.serve(async (req: Request) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { queryResult } = await req.json();
    const intentName = queryResult?.intent?.displayName;
    console.log("Intent received:", intentName);

    // Intent: Get Student Major Info
    if (intentName === "getStudentMajorInfo") {
      const studentId = queryResult?.parameters?.studentId;
      const studentName = queryResult?.parameters?.studentName?.name;

      console.log(`Received Student ID: ${studentId}, Name: ${studentName}`);

      if (!studentId && !studentName) {
        return new Response(
          JSON.stringify({ fulfillmentText: "NIM atau nama mahasiswa diperlukan. Bisa berikan salah satu?" }),
          { headers: { "Content-Type": "application/json" }, status: 200 }
        );
      }


      if (studentId && !studentName) {
        const { data, error } = await supabaseClient
          .from("students")
          .select("major")
          .eq("nim", studentId)
          .maybeSingle();

        if (error || !data) {
          return new Response(
            JSON.stringify({ fulfillmentText: `Tidak ditemukan mahasiswa dengan NIM ${studentId}.` }),
            { headers: { "Content-Type": "application/json" }, status: 200 }
          );
        }

        return new Response(JSON.stringify({ fulfillmentText: `Jurusan dari mahasiswa dengan NIM ${studentId} adalah ${data.major}` }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (!studentId && studentName) {
        const { data, error } = await supabaseClient
          .from("students")
          .select("major")
          .ilike("name", `%${studentName}%`)
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return new Response(
            JSON.stringify({ fulfillmentText: `Tidak ditemukan mahasiswa dengan nama ${studentName}.` }),
            { headers: { "Content-Type": "application/json" }, status: 200 }
          );
        }

        return new Response(JSON.stringify({ fulfillmentText: `Jurusan dari mahasiswa dengan nama ${studentName} adalah ${data.major}` }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        });
      }

      if (studentId && studentName) {
        const { data, error } = await supabaseClient
          .from("students")
          .select("nim, name, major")
          .eq("nim", studentId)
          .ilike("name", `%${studentName}%`)
          .maybeSingle();

        if (error || !data) {
          return new Response(
            JSON.stringify({ fulfillmentText: `Data tidak cocok untuk NIM ${studentId} dan nama ${studentName}.` }),
            { headers: { "Content-Type": "application/json" }, status: 200 }
          );
        }

        return new Response(
          JSON.stringify({ fulfillmentText: `Mahasiswa bernama ${data.name} dengan NIM ${data.nim} berada di jurusan ${data.major}` }),
          { headers: { "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    return new Response(
      JSON.stringify({ fulfillmentText: "Maaf, permintaan tidak dikenali." }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );


  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ fulfillmentText: `Terjadi kesalahan: ${error.message}` }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chatbot-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
