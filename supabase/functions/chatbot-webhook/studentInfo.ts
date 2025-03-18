// studentMajor.ts
import { supabaseClient } from "./supabase.ts";
// format student info fulfillment text
import { formatStudentInfo } from "./formatStudentInfo.ts";

export async function handleStudentInfo(queryResult) {
    const studentId = queryResult?.parameters?.studentId;
    const studentName = queryResult?.parameters?.studentName?.name;

    console.log(`Received Student ID: ${studentId}, Name: ${studentName}`);

    if (!studentId && !studentName) {
        return {
            fulfillmentText:
                "NIM atau nama mahasiswa diperlukan. Bisa berikan salah satu?",
        }
    }

    if (studentId && !studentName) {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .eq("nim", studentId)
            .maybeSingle();

        if (error || !data) {
            return {
                fulfillmentText:
                    `Tidak ditemukan mahasiswa dengan NIM ${studentId}.`,
            }
        }

        return {
            fulfillmentText:
                formatStudentInfo(data),
        }
    }

    if (!studentId && studentName) {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .ilike("name", `%${studentName}%`)
            .limit(1)
            .maybeSingle();

        if (error || !data) {
            return {
                fulfillmentText:
                    `Tidak ditemukan mahasiswa dengan nama ${studentName}.`,
            }
        }

        return {
            fulfillmentText:
                formatStudentInfo(data),
        }
    }

    if (studentId && studentName) {
        const { data, error } = await supabaseClient
            .from("students")
            .select("*")
            .eq("nim", studentId)
            .ilike("name", `%${studentName}%`)
            .maybeSingle();

        if (error || !data) {
            return {
                fulfillmentText: `Data tidak cocok untuk NIM ${studentId} dan nama ${studentName}.`,
            }
        }

        return {
            fulfillmentText: formatStudentInfo(data),
        }
    }
}
