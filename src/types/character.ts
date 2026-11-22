export interface SkillItem {
  id: string;
  label: string;
  value: number;
}

export interface CharacterProfile {
  id: string;
  groupName: string;
  name: string;
  imageUrl: string;
  maxValue: number;
  skills: SkillItem[];
}

export interface SkillPolygonDataset {
  version: number;
  updatedAt: string;
  activeCharacterId: string;
  characters: CharacterProfile[];
}