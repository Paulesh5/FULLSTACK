import { check, validationResult } from 'express-validator'

export const validacionTratamiento =[
    check(["nombre","descripcion","prioridad","paciente"])
        .exists()
            .withMessage('Los campos "nombre" "descripcion" "prioridad" y/o "paciente" son obligatorios')
        .notEmpty()
            .withMessage('Los campos "nombre" "descripcion" "prioridad" y/o "paciente" no pueden estar vacíos')
        .customSanitizer(value => value?.trim()),

    check("nombre")
        .isLength({ min: 3, max: 20 })
            .withMessage('El campo "nombre" debe tener entre 3 y 20 caracteres')
        .isAlpha('es-ES', { ignore: 'áéíóúÁÉÍÓÚñÑ' })
            .withMessage('El campo "nombre" debe contener solo letras')
        .customSanitizer(value => value?.trim()),

    check("descripcion")
        .isLength({ min: 5, max: 30 })
            .withMessage('El campo "descripcion" debe tener entre 5 y 30 caracteres')
        .customSanitizer(value => value?.trim()),

    check("prioridad")
        .isIn(['Baja', 'Media', 'Alta'])
            .withMessage('El campo "prioridad" debe ser Baja, Media o Alta'),

    check("paciente")
        .isMongoId()
            .withMessage('El ID del paciente no es válido'),


    (req,res,next)=>{
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        } else {
            return res.status(400).send({ errors: errors.array() });
        }
    }
]