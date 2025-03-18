export function formatStudentInfo(data) {
    const genderText = data.gender ? "Perempuan" : "Laki-laki";
  
    return `📌 Informasi Mahasiswa \n
  👤 Nama: ${data.name} \n
  🆔 NIM: ${data.nim}\n
  🚻 Jenis Kelamin: ${genderText}\n
  📧 Email: ${data.email}\n
  📞 Nomor HP: ${data.phone}\n
  🎓 Program Studi: ${data.major}\n
  📅 Tahun Masuk: ${data.enrollment_year}\n
  📊 IPK: ${data.gpa.toFixed(2)}\n\n
  
  Silakan hubungi akademik jika ada informasi yang tidak sesuai.`;
  }
  