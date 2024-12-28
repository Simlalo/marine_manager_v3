import { 
  CreateBarqueDTO, 
  UpdateBarqueDTO, 
  ValidationResult, 
  IMMATRICULATION_REGEX, 
  PORT_REGEX,
  BARQUE_STATUSES,
  BarqueError
} from '../types/barque';

export class ValidationService {
  static validateBarque(data: Partial<CreateBarqueDTO> | UpdateBarqueDTO, isImport: boolean = false): ValidationResult {
    const errors: Record<string, string> = {};

    // Validate immatriculation if present
    if (data.immatriculation !== undefined) {
      if (!isImport && !IMMATRICULATION_REGEX.test(data.immatriculation)) {
        errors.immatriculation = "L'immatriculation doit être au format XX/X-XXXX (ex: 10/1-5256)";
      }
    }

    // Validate port if present
    if (data.portAttache !== undefined) {
      // During import, only check if port is not empty and matches basic format
      if (isImport) {
        if (data.portAttache.trim() === '') {
          errors.portAttache = "Le port d'attache ne peut pas être vide";
        } else if (!/^\d{1,2}\/\d{1}$/.test(data.portAttache.trim())) {
          errors.portAttache = "Le port doit être au format XX/X (ex: 10/4)";
        }
      } else {
        if (!PORT_REGEX.test(data.portAttache)) {
          errors.portAttache = "Le port doit être au format XX/X (ex: 10/4)";
        }
      }
    }

    // Validate nom if present
    if (data.nom !== undefined) {
      if (data.nom.length < 2 || data.nom.length > 50) {
        errors.nom = "Le nom doit contenir entre 2 et 50 caractères";
      }
    }

    // Validate affiliation if present
    if (data.affiliation !== undefined) {
      if (data.affiliation.length < 2 || data.affiliation.length > 100) {
        errors.affiliation = "L'affiliation doit contenir entre 2 et 100 caractères";
      }
    }

    // Validate status if present
    if (data.statut !== undefined) {
      const validStatuses = Object.values(BARQUE_STATUSES);
      if (!validStatuses.includes(data.statut)) {
        errors.statut = "Le statut n'est pas valide";
      }
    }

    // Validate IDs if present
    if (data.gerantId !== undefined && typeof data.gerantId !== 'number') {
      errors.gerantId = "L'ID du gérant doit être un nombre";
    }

    if (data.responsableId !== undefined && typeof data.responsableId !== 'number') {
      errors.responsableId = "L'ID du responsable doit être un nombre";
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
      // Pass isImport=true to be more lenient with validation
      const validation = this.validateBarque(item, true);
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
      throw new BarqueError(
        'Validation failed',
        'VALIDATION_ERROR',
        undefined,
        validation.errors
      );
    }
  }
}
