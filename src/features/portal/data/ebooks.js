export const EBOOK_LINKS = {
  6: {
    bangla_first: 'https://drive.google.com/file/d/1jbIqeDMYPZMNIi0X54CLZ5DvJE_UChY9/view',
    bangla_second: 'https://drive.google.com/file/d/1rQ3XbgX7azu9CWBvyWNtI8uB9PDa-DYX/view',
    english_first: 'https://drive.google.com/file/d/1MsLUFdmZoZ8qKSVH74rpXm-wQCHEESiB/view',
    english_second: 'https://drive.google.com/file/d/1WhdraA55PFWAigg2UcN9_LpQcy1lEMfe/view',
    general_math: 'https://drive.google.com/file/d/1fj63KVxmVoaAOQ8IpbOCp8nJ2ewwkwi3/view',
    general_science: 'https://drive.google.com/file/d/1PNOAPkCFrhcmUrPe-5btT7W1fVzJnghv/view',
    ict: 'https://drive.google.com/file/d/1nbu5OQxUUXQ3aqmrnu8bIxvH7soILyRz/view',
    bgs: 'https://drive.google.com/file/d/1HRumSBLdYXxOYQTnoaFe5okVUCz1Nq8o/view',
    physical: 'https://drive.google.com/file/d/1LpdPp-hzhOOgYTuvOqM7qe4I9vHLMm1E/view',
    life: 'https://drive.google.com/file/d/1msxAg8yif_rYYfCEHmmP1lXIHRHTLvK9/view',
    religion: 'https://drive.google.com/file/d/1qQWF-tcdgXyO_F7N0kllv26S6On5aWxT/view',
    arts: 'https://drive.google.com/file/d/1yXWgJHUGfCU7Nw1BGT1iMBl8zeEqelS_/view',
  },
  7: {
    bangla_first: 'https://drive.google.com/file/d/1ckEB1y0SGO10-pfmplYFbxEUlOAWZ6tx/view',
    bangla_second: 'https://drive.google.com/file/d/1sjIDgfX268s2YwuFzVN9xD1-59V8el_L/view',
    english_first: 'https://drive.google.com/file/d/1Wtqc-MSvKsZoXX_oag7tTZpQ_VB8z8DG/view',
    english_second: 'https://drive.google.com/file/d/1ZGVzHw8KHYDxWTU_2m5JEDrhhW_bkyNF/view',
    general_math: 'https://drive.google.com/file/d/1ApxmGjYUBOiXprHvEPaPnKMVIDTgnPWy/view',
    general_science: 'https://drive.google.com/file/d/1uCJ-MtviXJSAg3q6IZC8hPnhueT7gua_/view',
    ict: 'https://drive.google.com/file/d/1apkdtwiTShAEUw8uyPQgXMNsnSZLSH-F/view',
    bgs: 'https://drive.google.com/file/d/1dEMvAZFn1Oq3sB9noqRfJNrYcbis8okK/view',
    physical: 'https://drive.google.com/file/d/1e0LNnfMOQWaYmrfCiDI_YKtBma5yUrkT/view',
    life: 'https://drive.google.com/file/d/1ZJsLuA-bBA4dp9vWlfWEbqP8Fsp95nSn/view',
    religion: 'https://drive.google.com/file/d/1lm8gWM5gJyd0N-EIdp09gFZaLYLzA32Q/view',
    arts: 'https://drive.google.com/file/d/1CKNr0KWx4jkSNRz5UGVnggGUuZuhJq4z/view',
  },
  8: {
    bangla_first: 'https://drive.google.com/file/d/1CRDDFTH32XZoy78SrFQ3m8wUujbLeuFY/view',
    bangla_second: 'https://drive.google.com/file/d/1O0aS5cJsRDqc47nIWY2uVLqldAEZGtk-/view',
    english_first: 'https://drive.google.com/file/d/1m7TlILofUr64YC61XBW96rhW0fvCI_dv/view',
    english_second: 'https://drive.google.com/file/d/1OfJd_F1uVMqE1KDaQHKhN3mQ-LcPm7rt/view',
    general_math: 'https://drive.google.com/file/d/1_1n5BHhXtccoSvh030AijjVwrJe9an6Z/view',
    general_science: 'https://drive.google.com/file/d/1Nr_XVz0fHd9V6AwqStfVwjT6rgMdCNAM/view',
    ict: 'https://drive.google.com/file/d/1oEuI_Jz62F3PrBn3M1doKwG2Y_qvf7d5/view',
    bgs: 'https://drive.google.com/file/d/1iS0uz1Ug1-J8NuJTnhXefVhGXNinltfc/view',
    physical: 'https://drive.google.com/file/d/1hJ9XpazoLHkA07xfbp9rgzeo4vqnbATy/view',
    life: 'https://drive.google.com/file/d/1lFT-G4HOD1NrV1Lx81nckAVG5lUpwWmo/view',
    religion: 'https://drive.google.com/file/d/1WB9eMmy0dqoSwFKjKwkB7g0Vg4xKe25S/view',
    arts: 'https://drive.google.com/file/d/1HlOIb6uXfu4dDpOJoudgpYSi70VswVJW/view',
  },
};

export function getSubjectKey(name = '') {
  const n = String(name || '').toLowerCase();
  if (n.includes('bangla') && (n.includes('first') || n.includes('1st') || /\b1\b/.test(n))) return 'bangla_first';
  if (n.includes('bangla') && (n.includes('second') || n.includes('2nd') || /\b2\b/.test(n))) return 'bangla_second';
  if (n.includes('english') && (n.includes('first') || n.includes('1st') || /\b1\b/.test(n))) return 'english_first';
  if (n.includes('english') && (n.includes('second') || n.includes('2nd') || /\b2\b/.test(n))) return 'english_second';
  if (n.includes('math')) return 'general_math';
  if (n.includes('science')) return 'general_science';
  if (n.includes('ict') || n.includes('information')) return 'ict';
  if (n.includes('bgs') || n.includes('bangladesh') || n.includes('global')) return 'bgs';
  if (n.includes('physical') || n.includes('health') || n.includes('phe')) return 'physical';
  if (n.includes('life') || n.includes('livelihood')) return 'life';
  if (n.includes('religion') || n.includes('moral')) return 'religion';
  if (n.includes('art') || n.includes('culture') || n.includes('craft')) return 'arts';
  return null;
}

export function resolveGrade(gradeOrClassName) {
  const str = String(gradeOrClassName || '').toLowerCase();
  if (/\b8\b/.test(str) || str.includes('eight')) return 8;
  if (/\b7\b/.test(str) || str.includes('seven')) return 7;
  if (/\b6\b/.test(str) || str.includes('six')) return 6;
  if (str.includes('8')) return 8;
  if (str.includes('7')) return 7;
  if (str.includes('6')) return 6;
  return 6;
}

export function getEbookUrl(subjectName, gradeOrClassName) {
  const grade = resolveGrade(gradeOrClassName);
  const key = getSubjectKey(subjectName);
  if (key && EBOOK_LINKS[grade] && EBOOK_LINKS[grade][key]) {
    return EBOOK_LINKS[grade][key];
  }
  return null;
}
