// studentMajor.ts
import { supabaseClient } from "./supabase.ts";
// format student info fulfillment text
import { formatStudentInfo } from "./formatStudentInfo.ts";

export async function handleStudentInfo(queryResult) {
    //session path
    const sessionPath = queryResult.outputContexts?.[0]?.name.split("/contexts/")[0];

    // contexts given
    const contexts = queryResult?.outputContexts || [];
    const studentContext = contexts.find(ctx => ctx.name.includes("awaiting_student_id"));
    console.log(`Student context: ${studentContext}`)
    const studentNameFromContext = studentContext?.parameters?.studentName;
    console.log(`Student name from context: ${studentNameFromContext}`)
    const requestedFieldsFromContext = studentContext?.parameters?.student_attribute || [];

    // parameters given
    const studentId = queryResult?.parameters?.studentId;
    // Extract studentName and attributes from Dialogflow parameters
    let studentName = queryResult?.parameters?.studentName?.name || studentContext?.parameters?.studentName;
    const requestedFields = (
        Array.isArray(queryResult?.parameters?.student_attribute) && queryResult.parameters.student_attribute.length > 0
    ) ? queryResult.parameters.student_attribute
        : studentContext?.parameters?.student_attribute || [];

    console.log(`Received Student ID: ${studentId}, Name: ${studentName}`);
    console.log(`Requested fields: ${requestedFields}`);


    if (!studentId && !studentName && !studentNameFromContext) {
        return {
            fulfillmentText:
                "NIM atau nama mahasiswa diperlukan. Bisa berikan salah satu?",
        }
    }

    // Ensure fields are valid
    const validFields = ["name", "nim", "gender", "email", "phone", "major", "enrollment_year", "gpa"];
    const fieldsToFetch = requestedFields?.length ? requestedFields : validFields;
    let selectedFields = fieldsToFetch.filter(field => validFields.includes(field));

    // ✅ Always include "name" and "nim"
    selectedFields = Array.from(new Set(["name", "nim", ...selectedFields]));

    if (selectedFields.length === 0) {
        return {
            fulfillmentText:
                "Maaf, tidak bisa memproses permintaan. Pastikan meminta informasi yang valid seperti IPK, jurusan, tahun masuk, dll.",
        }
    }

    // Database query
    let query = supabaseClient.from("students").select(selectedFields.join(", "));

    if (studentId && !studentName) {
        query = query.eq("nim", studentId);
    } else if (!studentId && studentName) {
        query = query.ilike("name", `%${studentName}%`);
    } else if (studentId && studentName) {
        query = query.eq("nim", studentId).ilike("name", `%${studentName}%`);
    }

    // Run the query
    const { data, error } = await query;

    // If error or no data was found
    if (error || !data) {
        return {
            fulfillmentText: `Data tidak cocok untuk data yang diberikan. Bisa coba berikan NIM atau nama lainnya?`,
        }
    }

    if (data.length > 1) {
        return {
            fulfillmentText: `Ditemukan ${data.length} pada data mahasiswa yang dicari. Bisa berikan NIM atau detail lainnya?`,
            outputContexts: [
                {
                    name: `${sessionPath}/contexts/awaiting_student_id`,
                    lifespanCount: 3,
                    parameters: {
                        studentName: studentName,
                        student_attribute: requestedFields
                    }
                }
            ]
        };
    }

    console.log("Context Before Returning Response:", JSON.stringify(studentContext, null, 2));
    console.log("Final Parameters Sent in Context:", JSON.stringify({
        studentName,
        requestedFields
    }, null, 2));


    console.log("Database Query Result:", JSON.stringify(data, null, 2));
    return {
        fulfillmentText: formatStudentInfo(data[0]),
    }

}
