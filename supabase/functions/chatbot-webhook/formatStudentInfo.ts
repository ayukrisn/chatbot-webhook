export function formatStudentInfo(data) {
  const fieldMap = {
      name: { label: "👤 Nama", value: data.name },
      nim: { label: "🆔 NIM", value: data.nim },
      gender: { label: "🚻 Jenis Kelamin", value: data.gender !== undefined ? (data.gender ? "Perempuan" : "Laki-laki") : null },
      email: { label: "📧 Email", value: data.email },
      phone: { label: "📞 Nomor HP", value: data.phone },
      major: { label: "🎓 Program Studi", value: data.major },
      enrollment_year: { label: "📅 Tahun Masuk", value: data.enrollment_year },
      gpa: { label: "📊 IPK", value: data.gpa !== undefined ? data.gpa.toFixed(2) : null }
  };

  // Build response dynamically by filtering out undefined/null fields
  const infoLines = Object.values(fieldMap)
      .filter(field => field.value !== null && field.value !== undefined)
      .map(field => `${field.label}: ${field.value}`);

  return infoLines.length > 0 
      ? `📌 Informasi Mahasiswa\n\n${infoLines.join("\n")}\n\nSilakan hubungi akademik jika ada informasi yang tidak sesuai.`
      : "⚠️ Tidak ada informasi yang tersedia untuk mahasiswa ini.";
}
