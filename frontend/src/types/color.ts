// Base types
export interface Color {
  id: string;
  name: string;
  hex_code: string;
  created_at: string;
  updated_at: string;
}

export interface ColorCreate {
  name: string;
  hex_code: string;
}

export interface ColorNested {
  id: string;
  name: string;
  hex_code: string;
}
