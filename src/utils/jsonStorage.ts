import { CharacterProfile, SkillPolygonDataset } from "../types/character";

const STORAGE_KEY = "skill_polygon_dataset_v1";

export const DEFAULT_CHARACTERS: CharacterProfile[] = [
  {
    id: "char-1",
    groupName: "צוות פיתוח",
    name: "דמות לדוגמה",
    imageUrl: "",
    maxValue: 10,
    skills: [
      { id: "1", label: "כוח", value: 8 },
      { id: "2", label: "מהירות", value: 6 },
      { id: "3", label: "חוכמה", value: 9 },
      { id: "4", label: "דיוק", value: 7 },
      { id: "5", label: "סיבולת", value: 5 },
    ],
  },
];

export function createInitialDataset(): SkillPolygonDataset {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    activeCharacterId: DEFAULT_CHARACTERS[0].id,
    characters: DEFAULT_CHARACTERS,
  };
}

export function loadDatasetFromStorage(): SkillPolygonDataset {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialDataset();
    const parsed = JSON.parse(raw) as SkillPolygonDataset;
    if (!Array.isArray(parsed.characters) || parsed.characters.length === 0) {
      return createInitialDataset();
    }
    return parsed;
  } catch {
    return createInitialDataset();
  }
}

export function saveDatasetToStorage(dataset: SkillPolygonDataset): void {
  const payload: SkillPolygonDataset = {
    ...dataset,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload, null, 2));
}

export function downloadDatasetAsJson(dataset: SkillPolygonDataset, fileName = "skills-data.json"): void {
  const jsonStr = JSON.stringify(dataset, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseUploadedJson(fileText: string): SkillPolygonDataset {
  const parsed = JSON.parse(fileText) as SkillPolygonDataset;
  if (!Array.isArray(parsed.characters) || parsed.characters.length === 0) {
    throw new Error("קובץ ה-JSON אינו מכיל רשימת דמויות תקינה.");
  }
  return {
    version: parsed.version ?? 1,
    updatedAt: new Date().toISOString(),
    activeCharacterId: parsed.activeCharacterId || parsed.characters[0].id,
    characters: parsed.characters,
  };
}