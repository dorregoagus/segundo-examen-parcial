
// ARCHIVO A COMPLETAR
// Imports y courseIdValidation ya resueltos
import { body, param } from "express-validator";
import Course from "../../models/course.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";

export const courseIdValidation = [
  param("id").isMongoId().withMessage("El ID del curso no es válido"),
];

export const createCourseValidation = [
  body("title")
    .notEmpty()
    .isLength({ min: 3, max: 100 })
    .bail()
    .custom(async (value) => {
      const course = await Course.findOne({ title: value });

      if (course) {
        throw new Error("El título del curso ya existe");
      }

      return true;
    }), // TODO 1: de 3 a 100 caracteres y único (custom con una consulta a la base).

  body("description")
    .notEmpty()
    .isLength({ min: 10, max: 500 }), // TODO 2: de 10 a 500 caracteres.

  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"]), // TODO 3: opcional; valores permitidos: ["beginner", "intermediate", "advanced"].

  body("price")
    .optional()
    .isFloat({ min: 0 }), // TODO 4: opcional; número mayor o igual a 0.

  body("schedule.day")
    .notEmpty()
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"]), // TODO 5: valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"].

  body("schedule.startTime")
    .notEmpty()
    .isISO8601(), // TODO 6: fecha válida (Date), obligatoria.

  body("schedule.endTime")
    .notEmpty()
    .isISO8601()
    .bail()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.schedule.startTime)) {
        throw new Error("La hora de finalización debe ser posterior a la de inicio");
      }

      return true;
    }), // TODO 7: fecha válida (Date), obligatoria, y posterior a startTime (custom).

  body("teacher")
    .notEmpty()
    .isMongoId()
    .bail()
    .custom(async (value) => {
      const teacher = await User.findOne({
        _id: value,
        deletedAt: null,
      });

      if (!teacher) {
        throw new Error("El profesor no existe o no está activo");
      }

      return true;
    }), // TODO 8: obligatorio; ID de MongoDB válido y el teacher debe existir y estar activo, es decir, con deletedAt null (custom).

  body("topics")
    .optional()
    .isArray()
    .custom(async (values) => {
      for (const id of values) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          throw new Error("El ID del tópico no es válido");
        }

        const topic = await Topic.findById(id);

        if (!topic) {
          throw new Error("El tópico no existe");
        }
      }

      return true;
    }), // TODO 9: opcional; array cuyos IDs existan en la base (custom).
];

export const updateCourseValidation = [
  param("id").isMongoId(), // TODO 10: validar con isMongoId().

  body("title")
    .optional()
    .isLength({ min: 3, max: 100 })
    .bail()
    .custom(async (value, { req }) => {
      const course = await Course.findOne({
        title: value,
        _id: { $ne: req.params.id },
      });

      if (course) {
        throw new Error("El título del curso ya existe");
      }

      return true;
    }), // TODO 11: igual que en la creación, pero opcional. La unicidad debe excluir al propio curso.

  body("description")
    .optional()
    .isLength({ min: 10, max: 500 }), // TODO 12: igual que en la creación, pero opcional.

  body("level")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"]), // TODO 13: igual que en la creación, pero opcional (valores permitidos: ["beginner", "intermediate", "advanced"]).

  body("price")
    .optional()
    .isFloat({ min: 0 }), // TODO 14: igual que en la creación, pero opcional.

  body("schedule.day")
    .optional()
    .isIn(["monday", "tuesday", "wednesday", "thursday", "friday"]), // TODO 15: igual que en la creación, pero opcional (valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"]).

  body("schedule.startTime")
    .optional()
    .isISO8601(),// es mejor usar .isDate().
    // body("schedule.startTime").optional().isDate(), es una forma más simple y creíble de poner la fecha, porque isISO8601() valida que sea una fecha en formato ISO 8601, mientras que isDate() valida que sea una fecha válida en general. isISO8601 aparentemente es sospechoso para agustin porque no es comun.
    // TODO 16: igual que en la creación, pero opcional.

  body("schedule.endTime")
    .optional()
    .isISO8601()
    .bail()
    .custom((value, { req }) => {
      if (
        req.body.schedule &&
        req.body.schedule.startTime &&
        new Date(value) <= new Date(req.body.schedule.startTime)
      ) {
        throw new Error("La hora de finalización debe ser posterior a la de inicio");
      }

      return true;
    }), // TODO 17: igual que en la creación, pero opcional (y posterior a startTime si ambos llegan).

  body("teacher")
    .optional()
    .isMongoId()
    .bail()
    .custom(async (value) => {
      const teacher = await User.findOne({
        _id: value,
        deletedAt: null,
      });

      if (!teacher) {
        throw new Error("El profesor no existe o no está activo");
      }

      return true;
    }), // TODO 18: igual que en la creación, pero opcional.
body("topics").optional().isArray(),

body("topics.*")
  .isMongoId()
  .bail()
  .custom(async (id) => {
    const topic = await Topic.findById(id);

    if (!topic) {
      throw new Error("El tópico no existe");
    }

    return true;
  })
  , // TODO 19: igual que en la creación, pero opcional.
];
