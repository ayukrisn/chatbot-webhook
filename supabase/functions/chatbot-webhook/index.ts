import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { handleStudentMajorInfo } from "./studentMajor.ts";
import { handleStudentInfo } from "./studentInfo.ts";

console.log("Processing request from Dialogflow API");

Deno.serve(async (req: Request) => {
  try {
    const { queryResult } = await req.json();
    const intentName = queryResult?.intent?.displayName;
    console.log("Intent received:", intentName);

    let response = { fulfillmentText: "Maaf, permintaan tidak dikenali." };

    // Intent: Get Student Major Info
    if (intentName === "getStudentMajorInfo") {
      response = await handleStudentMajorInfo(queryResult);
    } else if (intentName === "getStudentInfo" || intentName === "getStudentInfo_provideNIM") {
      response = await handleStudentInfo(queryResult);
    }

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        fulfillmentText: `Terjadi kesalahan: ${error.message}`,
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
