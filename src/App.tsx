import React, { useEffect, useRef, useState } from "react";
import { SkillPolygonChart } from "./components/SkillPolygonChart";
import { CharacterProfile, SkillPolygonDataset } from "./types/character";
import {
  downloadDatasetAsJson,
  loadDatasetFromStorage,
  parseUploadedJson,
  saveDatasetToStorage,
} from "./utils/jsonStorage";

export default function App() {
  const [dataset, setDataset] = useState<SkillPolygonDataset>(() => loadDatasetFromStorage());
  const [newSkillName, setNewSkillName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveDatasetToStorage(dataset);
  }, [dataset]);

  const activeCharacter: CharacterProfile =
    dataset.characters.find((c) => c.id === dataset.activeCharacterId) ?? dataset.characters[0];

  const updateActiveCharacter = (updater: (char: CharacterProfile) => CharacterProfile) => {
    setDataset((prev) => ({
      ...prev,
      characters: prev.characters.map((char) =>
        char.id === activeCharacter.id ? updater(char) : char
      ),
    }));
  };

  const addCharacter = () => {
    const newId = `char-${crypto.randomUUID()}`;
    const newChar: CharacterProfile = {
      id: newId,
      groupName: activeCharacter.groupName || "קבוצה חדשה",
      name: "דמות חדשה",
      imageUrl: "",
      maxValue: activeCharacter.maxValue || 10,
      skills: activeCharacter.skills.map((s) => ({
        ...s,
        id: crypto.randomUUID(),
        value: 5,
      })),
    };

    setDataset((prev) => ({
      ...prev,
      activeCharacterId: newId,
      characters: [...prev.characters, newChar],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateActiveCharacter((char) => ({ ...char, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSkillValue = (skillId: string, value: number) => {
    updateActiveCharacter((char) => ({
      ...char,
      skills: char.skills.map((s) => (s.id === skillId ? { ...s, value } : s)),
    }));
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    updateActiveCharacter((char) => ({
      ...char,
      skills: [...char.skills, { id: crypto.randomUUID(), label: trimmed, value: 5 }],
    }));
    setNewSkillName("");
  };

  const removeSkill = (skillId: string) => {
    if (activeCharacter.skills.length <= 3) return;
    updateActiveCharacter((char) => ({
      ...char,
      skills: char.skills.filter((s) => s.id !== skillId),
    }));
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");

    try {
      const text = await file.text();
      const imported = parseUploadedJson(text);
      setDataset(imported);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "שגיאה בקריאת קובץ ה-JSON");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div dir="rtl" style={{ maxWidth: 920, margin: "2rem auto", fontFamily: "sans-serif" }}>
      {/* סרגל דמויות ופעולות JSON */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 12,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {dataset.characters.map((char) => (
          <button
            key={char.id}
            type="button"
            onClick={() => setDataset((prev) => ({ ...prev, activeCharacterId: char.id }))}
            style={{
              fontWeight: char.id === activeCharacter.id ? 700 : 400,
              padding: "6px 12px",
            }}
          >
            {char.name}
          </button>
        ))}

        <button type="button" onClick={addCharacter} style={{ padding: "6px 12px" }}>
          + דמות חדשה
        </button>

        <div style={{ marginRight: "auto", display: "flex", gap: 8 }}>
          <button type="button" onClick={() => downloadDatasetAsJson(dataset)}>
            הורד JSON
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            ייבא JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportJson}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {errorMsg && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{errorMsg}</div>}

      {/* פרטי הדמות */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          value={activeCharacter.name}
          onChange={(e) => updateActiveCharacter((c) => ({ ...c, name: e.target.value }))}
          placeholder="שם הדמות"
          style={{ fontSize: 18, fontWeight: 700, padding: "6px 10px" }}
        />
        <input
          value={activeCharacter.groupName}
          onChange={(e) => updateActiveCharacter((c) => ({ ...c, groupName: e.target.value }))}
          placeholder="קבוצה / קטגוריה"
          style={{ padding: "6px 10px" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          תמונה:
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      {/* תצוגת כרטיס + פוליגון ועריכת סקילים */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div
          style={{
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            padding: 16,
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            {activeCharacter.imageUrl && (
              <img
                src={activeCharacter.imageUrl}
                alt={activeCharacter.name}
                style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover" }}
              />
            )}
            <div>
              <h2 style={{ margin: 0 }}>{activeCharacter.name}</h2>
              {activeCharacter.groupName && (
                <small style={{ color: "#64748b" }}>{activeCharacter.groupName}</small>
              )}
            </div>
          </div>

          <SkillPolygonChart
            skills={activeCharacter.skills}
            maxValue={activeCharacter.maxValue}
          />
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <form onSubmit={addSkill} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="שם סקיל חדש..."
              style={{ flex: 1, padding: "6px 10px" }}
            />
            <button type="submit">הוסף סקיל</button>
          </form>

          {activeCharacter.skills.map((skill) => (
            <div key={skill.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{skill.label}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  disabled={activeCharacter.skills.length <= 3}
                >
                  מחק
                </button>
              </div>
              <input
                type="range"
                min={0}
                max={activeCharacter.maxValue}
                value={skill.value}
                onChange={(e) => updateSkillValue(skill.id, Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}