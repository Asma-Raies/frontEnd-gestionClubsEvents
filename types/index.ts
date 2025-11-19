export interface UserDTO {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
}

export interface UpdateProfileDTO {
  nom: string;
  prenom: string;
  telephone: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}