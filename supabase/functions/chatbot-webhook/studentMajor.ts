// studentMajor.ts
import { supabaseClient } from "./supabase.ts";

export async function handleStudentMajorInfo(queryResult) {
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
            .select("major")
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
                `Jurusan dari mahasiswa dengan NIM ${studentId} adalah ${data.major}`,
        }
    }

    if (!studentId && studentName) {
        const { data, error } = await supabaseClient
            .from("students")
            .select("major")
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
                `Jurusan dari mahasiswa dengan nama ${studentName} adalah ${data.major}`,
        }
    }

    if (studentId && studentName) {
        const { data, error } = await supabaseClient
            .from("students")
            .select("nim, name, major")
            .eq("nim", studentId)
            .ilike("name", `%${studentName}%`)
            .maybeSingle();

        if (error || !data) {
            return {
                fulfillmentText: `Data tidak cocok untuk NIM ${studentId} dan nama ${studentName}.`,
            }
        }

        return {
            fulfillmentText: `Mahasiswa bernama ${data.name} dengan NIM ${data.nim} berada di jurusan ${data.major}`,
        }
    }
}
