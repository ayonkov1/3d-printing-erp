// Base types
export interface Material {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface MaterialCreate {
  name: string;
}

export interface MaterialNested {
  id: string;
  name: string;
}
