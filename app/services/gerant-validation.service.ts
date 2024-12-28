import { 
  CreateGerantDTO, 
  UpdateGerantDTO, 
  ValidationResult, 
  CINE_REGEX, 
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  GerantValidationError
} from '../types/gerant';

export class GerantValidationService {
  static validateGerant(data: Partial<CreateGerantDTO> | UpdateGerantDTO): ValidationResult {
    const errors: Record<string, string> = {};

    // Validate nom if present
    if (data.nom !== undefined) {
      if (!data.nom.trim()) {
        errors.nom = "Le nom est requis";
      } else if (data.nom.length < 2 || data.nom.length > 50) {
        errors.nom = "Le nom doit contenir entre 2 et 50 caractères";
      }
    }

    // Validate prenom if present
    if (data.prenom !== undefined) {
      if (!data.prenom.trim()) {
        errors.prenom = "Le prénom est requis";
      } else if (data.prenom.length < 2 || data.prenom.length > 50) {
        errors.prenom = "Le prénom doit contenir entre 2 et 50 caractères";
      }
    }

    // Validate CINE if present
    if (data.cine !== undefined) {
      if (!CINE_REGEX.test(data.cine)) {
        errors.cine = "Le format du CINE n'est pas valide";
      }
    }

    // Validate telephone if present
    if (data.telephone !== undefined) {
      if (!PHONE_REGEX.test(data.telephone)) {
        errors.telephone = "Le format du numéro de téléphone n'est pas valide";
      }
    }

    // Validate email if present
    if (data.email !== undefined) {
      if (!EMAIL_REGEX.test(data.email)) {
        errors.email = "L'adresse email n'est pas valide";
      }
    }

    // Validate password if present
    if (data.password !== undefined) {
      if (!PASSWORD_REGEX.test(data.password)) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateImport(data: any[]): ValidationResult {
    const errors: Record<string, string> = {};
    
    if (!Array.isArray(data)) {
      errors.format = "Le fichier d'import doit contenir un tableau de données";
      return { isValid: false, errors };
    }

    data.forEach((item, index) => {
      const validation = this.validateGerant(item);
      if (!validation.isValid) {
        errors[`ligne_${index + 1}`] = Object.values(validation.errors).join(', ');
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static throwIfInvalid(validation: ValidationResult): void {
    if (!validation.isValid) {
      throw new GerantValidationError(
        'Validation failed',
        'VALIDATION_ERROR',
        undefined,
        validation.errors
      );
    }
  }

  static validatePassword(password: string): ValidationResult {
    const errors: Record<string, string> = {};

    if (!PASSWORD_REGEX.test(password)) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
