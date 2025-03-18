// studentMajor.ts
import { supabaseClient } from "./supabase.ts";
// format student info fulfillment text
import { formatStudentInfo } from "./formatStudentInfo.ts";

export async function handleStudentInfo(queryResult) {
    const studentId = queryResult?.parameters?.studentId;
    const studentName = queryResult?.parameters?.studentName?.name;
    const requestedFields = Array.isArray(queryResult?.parameters?.student_attribute)
        ? queryResult.parameters.student_attribute
        : [];

    console.log(`Received Student ID: ${studentId}, Name: ${studentName}`);
    console.log(`Requested fields: ${requestedFields}`);

    if (!studentId && !studentName) {
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
    const { data, error } = await query.maybeSingle();

    // If error or no data was found
    if (error || !data) {
        return {
            fulfillmentText: `Data tidak cocok untuk data yang diberikan. Bisa coba berikan NIM atau nama lainnya?`,
        }
    }

    return {
        fulfillmentText: formatStudentInfo(data),
    }

}
